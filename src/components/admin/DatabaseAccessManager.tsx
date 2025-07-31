import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DatabaseAccess {
  id: string;
  database_name: string;
  plan_tier: string;
  accessible: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const DatabaseAccessManager = () => {
  const [databaseAccess, setDatabaseAccess] = useState<DatabaseAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDatabaseAccess();
  }, []);

  const fetchDatabaseAccess = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('database_plan_access')
        .select('*')
        .order('database_name', { ascending: true })
        .order('plan_tier', { ascending: true });

      if (error) throw error;
      setDatabaseAccess(data || []);
    } catch (error) {
      console.error('Error fetching database access:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les accès aux bases de données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (id: string, currentAccess: boolean) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from('database_plan_access')
        .update({ 
          accessible: !currentAccess,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setDatabaseAccess(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, accessible: !currentAccess } 
            : item
        )
      );

      toast({
        title: "Succès",
        description: `Accès ${!currentAccess ? 'autorisé' : 'restreint'} avec succès`,
      });
    } catch (error) {
      console.error('Error updating database access:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'accès",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getPlanBadgeVariant = (planTier: string) => {
    switch (planTier) {
      case 'premium': return 'default';
      case 'standard': return 'secondary';
      case 'freemium': return 'outline';
      default: return 'outline';
    }
  };

  const groupedAccess = databaseAccess.reduce((acc, item) => {
    if (!acc[item.database_name]) {
      acc[item.database_name] = [];
    }
    acc[item.database_name].push(item);
    return acc;
  }, {} as Record<string, DatabaseAccess[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion des Accès aux Bases de Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
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
          <Database className="h-5 w-5" />
          Gestion des Accès aux Bases de Données
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Base de données</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Accès</TableHead>
              <TableHead>Dernière modification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedAccess).map(([databaseName, items]) => 
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      {index === 0 ? databaseName : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPlanBadgeVariant(item.plan_tier)}>
                      {item.plan_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.accessible ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Autorisé</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Restreint</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={item.accessible}
                        onCheckedChange={() => toggleAccess(item.id, item.accessible)}
                        disabled={updating === item.id}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(item.updated_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
            {databaseAccess.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucune règle d'accès configurée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};