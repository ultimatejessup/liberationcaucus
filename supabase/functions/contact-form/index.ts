import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, message, recaptchaToken } = await req.json();

    // Validate inputs
    if (!name || !email || !message || !recaptchaToken) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      console.error('Input exceeds length limits');
      return new Response(
        JSON.stringify({ error: 'Input exceeds allowed length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify reCAPTCHA v3
    const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!recaptchaSecret) {
      console.error('Missing RECAPTCHA_SECRET_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
    });

    const recaptchaResult = await recaptchaResponse.json();
    console.log('reCAPTCHA result:', JSON.stringify({ success: recaptchaResult.success, score: recaptchaResult.score }));

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      console.error('reCAPTCHA verification failed', recaptchaResult);
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification failed. Please try again.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ name, email, message });

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error('Failed to save submission');
    }

    console.log('Contact submission saved to database');

    // Send email notification
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const notificationEmail = Deno.env.get('CONTACT_NOTIFICATION_EMAIL');

    if (resendKey && notificationEmail) {
      const resend = new Resend(resendKey);
      const { error: emailError } = await resend.emails.send({
        from: 'Liberation Caucus <onboarding@resend.dev>',
        to: [notificationEmail],
        subject: `New Contact Form: ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color:#888;font-size:12px;">Submitted via Liberation Caucus website</p>
        `,
      });

      if (emailError) {
        console.error('Email send error:', emailError);
        // Don't fail the request if email fails — submission is already saved
      } else {
        console.log('Notification email sent successfully');
      }
    } else {
      console.warn('Email notification skipped: missing RESEND_API_KEY or CONTACT_NOTIFICATION_EMAIL');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});