import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const UnifiedNavbar = () => {
  const { user, signOut } = useAuth();
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
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold homepage-text">
              SAMI
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100">
                    Favoris
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100">
                    Profil
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
                  <Button variant="ghost" className="homepage-text hover:bg-violet-100">
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