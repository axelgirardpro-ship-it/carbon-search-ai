import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FreemiumCompany {
  id: string;
  name: string;
  owner_id: string;
  plan_type: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
  owner_email?: string;
  subscription_status?: {
    plan_type: string;
    subscribed: boolean;
  };
}

export const FreemiumCompaniesTable = () => {
  const [companies, setCompanies] = useState<FreemiumCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreemiumCompanies();
  }, []);

  const fetchFreemiumCompanies = async () => {
    try {
      setLoading(true);
      
      // Use edge function to get freemium workspaces
      console.log('FreemiumCompaniesTable: Calling edge function with planFilter: freemium');
      const { data, error } = await supabase.functions.invoke('get-admin-workspaces', {
        body: { planFilter: 'freemium' }
      });

      console.log('FreemiumCompaniesTable: Edge function response:', { data, error });

      if (error) throw error;

      if (data?.data) {
        console.log('FreemiumCompaniesTable: Setting companies:', data.data.map((c: any) => `${c.name}: ${c.plan_type}`));
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching freemium companies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Entreprises Freemium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Entreprises Freemium ({companies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entreprise</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Utilisateurs</TableHead>
              <TableHead>Créée le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{company.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {company.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    {company.owner_email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {company.subscription_status?.plan_type || company.plan_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {company.user_count}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(company.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucune entreprise freemium trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};