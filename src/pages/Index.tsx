import EmailSignupPopup from "@/components/EmailSignupPopup";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <EmailSignupPopup />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Liberation Caucus</h1>
        <p className="text-xl text-muted-foreground">Advancing justice, equity, and liberation for Black communities.</p>
      </div>
    </div>
  );
};

export default Index;
