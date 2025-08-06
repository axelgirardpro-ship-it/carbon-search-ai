import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSupraAdmin } from "@/hooks/useSupraAdmin";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuotas } from "@/hooks/useQuotas";
import { NavbarQuotaWidget } from "@/components/ui/NavbarQuotaWidget";
import { Lock } from "lucide-react";

export const UnifiedNavbar = () => {
  const { user, signOut } = useAuth();
  const { isSupraAdmin } = useSupraAdmin();
  const { canUseFavorites } = usePermissions();
  const { quotaData, isLoading, isAtLimit } = useQuotas();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="border-b border-violet-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={user ? "/search" : "/"} className="text-2xl font-bold homepage-text">
              SAMI
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:block">
                  <NavbarQuotaWidget quotaData={quotaData} isLoading={isLoading} isAtLimit={isAtLimit} />
                </div>
                <Link to="/search">
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100 hover:text-indigo-950">
                    Recherche
                  </Button>
                </Link>
                {canUseFavorites ? (
                  <Link to="/favorites">
                    <Button variant="ghost" className="homepage-text hover:bg-violet-100 hover:text-indigo-950">
                      Favoris
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="homepage-text opacity-50 cursor-not-allowed"
                    disabled
                    title="Fonctionnalité disponible uniquement avec le plan Premium"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                )}
                {isSupraAdmin && (
                  <Link to="/import">
                    <Button variant="ghost" className="homepage-text hover:bg-violet-100 hover:text-indigo-950">
                      Import
                    </Button>
                  </Link>
                )}
                <Link to="/settings">
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100 hover:text-indigo-950">
                    Paramètres
                  </Button>
                </Link>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100 hover:text-indigo-950">
                    S'inscrire
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="homepage-button">
                    Se connecter
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};