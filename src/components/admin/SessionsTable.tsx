import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, LogOut, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface UserSession {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  session_token: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
  user_email?: string;
}

export const SessionsTable = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // Get sessions
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('last_activity', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(data.map(session => session.user_id))];
        
        // Fetch user emails using the edge function
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'get-admin-users',
          { body: { userIds } }
        );

        if (emailError) {
          console.error('Error fetching user emails:', emailError);
        }

        // Map sessions with emails
        const sessionsWithEmails = data.map(session => ({
          ...session,
          ip_address: session.ip_address as string | null,
          user_agent: session.user_agent as string | null,
          user_email: emailData?.users?.[session.user_id] || 'Email non disponible'
        }));

        setSessions(sessionsWithEmails);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'session_terminated_by_admin',
        details: { session_id: sessionId, terminated_by: 'admin' }
      });

      toast({
        title: "Session terminée",
        description: "La session a été terminée avec succès",
      });

      loadSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la session",
        variant: "destructive",
      });
    }
  };

  const isSessionSuspicious = (session: UserSession) => {
    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Session suspicious if inactive for more than 24 hours but still valid
    return hoursSinceActivity > 24 && new Date(session.expires_at) > now;
  };

  useEffect(() => {
    loadSessions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sessions actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Sessions actives ({sessions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Navigateur</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const isExpired = new Date(session.expires_at) < new Date();
                const isSuspicious = isSessionSuspicious(session);
                
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.user_email}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {session.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {session.ip_address || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate text-xs text-muted-foreground">
                        {session.user_agent || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {formatDistanceToNow(new Date(session.last_activity), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {isExpired ? (
                          <Badge variant="destructive">Expirée</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                        {isSuspicious && (
                          <Badge variant="secondary" className="text-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Suspecte
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!isExpired && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => terminateSession(session.id, session.user_id)}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Terminer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune session active
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};