import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, User, Mail, Lock, Building, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SSOButton } from "@/components/ui/SSOButton";
import { SSOProvider, useSSO } from "@/components/ui/SSOProvider";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    termsAccepted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithGoogle, signInWithMicrosoft, signInWithSAML } = useAuth();
  const { ssoState, setProviderLoading, setLastError } = useSSO();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }
    
    if (!formData.termsAccepted) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez accepter les conditions d'utilisation",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
        // Rediriger vers login après inscription
        navigate("/login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSSOSignup = async (provider: 'google' | 'microsoft' | 'saml') => {
    setProviderLoading(provider, true);
    setLastError(null);
    
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'microsoft':
          result = await signInWithMicrosoft();
          break;
        case 'saml':
          result = await signInWithSAML();
          break;
      }

      if (result.error) {
        const errorMessage = {
          google: "Erreur lors de l'inscription avec Google",
          microsoft: "Erreur lors de l'inscription avec Microsoft",
          saml: "Erreur lors de l'inscription SAML"
        };
        
        toast({
          variant: "destructive",
          title: errorMessage[provider],
          description: result.error.message,
        });
        setLastError(result.error.message);
      }
    } catch (error) {
      const errorMessage = {
        google: "Erreur lors de l'inscription avec Google",
        microsoft: "Erreur lors de l'inscription avec Microsoft", 
        saml: "Erreur lors de l'inscription SAML"
      };
      
      toast({
        variant: "destructive",
        title: errorMessage[provider],
        description: "Une erreur inattendue s'est produite",
      });
      setLastError("Une erreur inattendue s'est produite");
    } finally {
      setProviderLoading(provider, false);
    }
  };

  return (
    <div className="min-h-screen homepage-violet-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center homepage-text hover:opacity-80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">EC</span>
            </div>
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez EcoSearch et accédez à notre base de données complète
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Inscription sécurisée</h3>
            <p className="text-sm text-blue-700">
              Pour des raisons de sécurité, l'inscription est uniquement disponible via SSO d'entreprise. 
              Utilisez votre compte professionnel Google, Microsoft ou SAML pour créer votre compte.
            </p>
          </div>

          <div className="space-y-3">
            <SSOButton
              provider="google"
              onClick={() => handleSSOSignup('google')}
              loading={ssoState.loading.google}
              disabled={Object.values(ssoState.loading).some(loading => loading)}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
            >
              S'inscrire avec Google
            </SSOButton>

            <SSOButton
              provider="microsoft"
              onClick={() => handleSSOSignup('microsoft')}
              loading={ssoState.loading.microsoft}
              disabled={Object.values(ssoState.loading).some(loading => loading)}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M13 1h10v10H13z"/>
                  <path fill="#05a6f0" d="M1 13h10v10H1z"/>
                  <path fill="#ffba08" d="M13 13h10v10H13z"/>
                </svg>
              }
            >
              S'inscrire avec Microsoft
            </SSOButton>

            <SSOButton
              provider="saml"
              onClick={() => handleSSOSignup('saml')}
              loading={ssoState.loading.saml}
              disabled={Object.values(ssoState.loading).some(loading => loading)}
              icon={
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              }
            >
              S'inscrire avec SAML
            </SSOButton>
          </div>

          {/* Error Alert */}
          {ssoState.lastError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {ssoState.lastError}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Signup = () => {
  return (
    <SSOProvider>
      <SignupForm />
    </SSOProvider>
  );
};

export default Signup;