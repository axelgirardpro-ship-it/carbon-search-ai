import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Mail, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/ui/RoleGuard";

interface TeamMember {
  id: string;
  user_id: string;
  role: 'admin' | 'gestionnaire' | 'lecteur';
  assigned_by: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface PendingInvitation {
  id: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'lecteur';
  expires_at: string;
  status: string;
  created_at: string;
}

const Team = () => {
  const { user, userRole } = useAuth();
  const { canAddUsers, getRoleLabel } = usePermissions();
  const { toast } = useToast();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "lecteur" as 'admin' | 'gestionnaire' | 'lecteur'
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  const loadTeamData = async () => {
    if (!userRole?.company_id) return;

    try {
      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('company_id', userRole.company_id);

      if (membersError) throw membersError;

      // Get profiles for each user
      const membersWithProfiles = await Promise.all(
        (members || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', member.user_id)
            .single();

          return {
            ...member,
            profiles: profile || { first_name: '', last_name: '' }
          };
        })
      );

      setTeamMembers(membersWithProfiles as TeamMember[]);

      // Load pending invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('company_invitations')
        .select('*')
        .eq('company_id', userRole.company_id)
        .eq('status', 'pending');

      if (invitationsError) throw invitationsError;
      setPendingInvitations(invitations as PendingInvitation[] || []);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du chargement des données de l'équipe",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [userRole]);

  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    setInviteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteForm.email,
          role: inviteForm.role,
          companyName: userRole?.companies.name
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: `Invitation envoyée à ${inviteForm.email}`,
      });

      setInviteForm({ email: "", role: "lecteur" });
      setInviteDialogOpen(false);
      loadTeamData(); // Refresh data
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi de l'invitation",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membre supprimé",
        description: "Le membre a été retiré de l'équipe",
      });

      loadTeamData(); // Refresh data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la suppression du membre",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'gestionnaire':
        return 'secondary';
      case 'lecteur':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleTranslation = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'gestionnaire':
        return 'Gestionnaire';
      case 'lecteur':
        return 'Lecteur';
      default:
        return role;
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p className="text-muted-foreground">Vous devez être membre d'une équipe pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Users className="w-8 h-8 mr-3 text-primary" />
                Gestion de l'équipe
              </h1>
              <p className="text-muted-foreground">
                Gérez les membres de votre équipe {userRole.companies.name}
              </p>
            </div>
            
            <RoleGuard requirePermission="canAddUsers">
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Inviter un utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
                    <DialogDescription>
                      Envoyez une invitation par email pour rejoindre votre équipe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lecteur">Lecteur</SelectItem>
                          <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleInviteUser}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? "Envoi..." : "Envoyer l'invitation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </RoleGuard>
          </div>

          {/* Team Members */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Membres de l'équipe ({teamMembers.length})</CardTitle>
              <CardDescription>
                Liste des membres actuels de votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Chargement...</p>
              ) : teamMembers.length === 0 ? (
                <p className="text-center text-muted-foreground">Aucun membre dans l'équipe</p>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {member.profiles?.first_name} {member.profiles?.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {member.user_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {getRoleTranslation(member.role)}
                        </Badge>
                        <RoleGuard requirePermission="canAddUsers">
                          {member.user_id !== user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </RoleGuard>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invitations en attente ({pendingInvitations.length})</CardTitle>
                <CardDescription>
                  Invitations envoyées en attente d'acceptation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{invitation.email}</h4>
                          <p className="text-sm text-muted-foreground">
                            Invité le {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(invitation.role)}>
                          {getRoleTranslation(invitation.role)}
                        </Badge>
                        <Badge variant="outline" className="text-orange-600">
                          En attente
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;