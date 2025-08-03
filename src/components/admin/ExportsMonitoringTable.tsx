import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, AlertTriangle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserQuota {
  id: string;
  user_id: string;
  exports_used: number;
  exports_limit: number;
  plan_type: string;
  reset_date: string;
  user_email?: string;
}

export const ExportsMonitoringTable = () => {
  const [quotas, setQuotas] = useState<UserQuota[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadQuotas = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('search_quotas')
        .select('*')
        .order('exports_used', { ascending: false });

      if (error) throw error;

      // Get user IDs for batch email fetching
      const userIds = (data || []).map(quota => quota.user_id);
      
      if (userIds.length === 0) {
        setQuotas([]);
        return;
      }

      // Fetch emails using admin edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('get-admin-users', {
        body: { userIds }
      });

      if (emailError) {
        console.error('Error fetching user emails:', emailError);
        // Fallback to quotas without emails
        setQuotas((data || []).map(quota => ({ ...quota, user_email: 'Email non disponible' })));
        return;
      }

      // Map emails to quotas
      const quotasWithEmails = (data || []).map(quota => ({
        ...quota,
        user_email: emailData.users[quota.user_id] || 'Email non disponible'
      }));

      setQuotas(quotasWithEmails);
    } catch (error) {
      console.error('Error loading quotas:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les quotas d'exports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetUserQuota = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('search_quotas')
        .update({ 
          exports_used: 0,
          reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'quota_reset_by_admin',
        details: { reset_by: 'admin', user_email: userEmail }
      });

      toast({
        title: "Quota réinitialisé",
        description: `Le quota d'exports de ${userEmail} a été réinitialisé`,
      });

      loadQuotas();
    } catch (error) {
      console.error('Error resetting quota:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le quota",
        variant: "destructive",
      });
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageBadge = (used: number, limit: number) => {
    const percentage = getUsagePercentage(used, limit);
    
    if (percentage >= 100) {
      return <Badge variant="destructive">Limite atteinte</Badge>;
    } else if (percentage >= 80) {
      return <Badge variant="secondary" className="text-orange-600">Proche limite</Badge>;
    } else if (percentage >= 50) {
      return <Badge variant="secondary">Usage modéré</Badge>;
    } else {
      return <Badge variant="default">Usage normal</Badge>;
    }
  };

  useEffect(() => {
    loadQuotas();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Monitoring des exports
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
          <Download className="h-5 w-5" />
          Monitoring des exports ({quotas.length} utilisateurs)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Exports utilisés</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prochaine réinitialisation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotas.map((quota) => {
                const percentage = getUsagePercentage(quota.exports_used, quota.exports_limit);
                const resetDate = new Date(quota.reset_date);
                const isNearLimit = percentage >= 80;
                
                return (
                  <TableRow key={quota.id} className={isNearLimit ? "bg-orange-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {quota.user_email}
                        {isNearLimit && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {quota.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quota.plan_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={percentage >= 100 ? "text-red-600 font-semibold" : ""}>
                        {quota.exports_used} / {quota.exports_limit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-full max-w-20">
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${percentage >= 100 ? "bg-red-100" : percentage >= 80 ? "bg-orange-100" : ""}`}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {percentage}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUsageBadge(quota.exports_used, quota.exports_limit)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {resetDate.toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetUserQuota(quota.user_id, quota.user_email || '')}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {quotas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun quota d'export trouvé
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