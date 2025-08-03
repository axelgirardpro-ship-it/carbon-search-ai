import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Crown, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SourceAccessData {
  source: string;
  current_tier: 'standard' | 'premium';
  standard_count: number;
  premium_count: number;
  total_count: number;
}

export const EmissionFactorAccessManager = () => {
  console.log('🚀 EmissionFactorAccessManager: Component mounting...');
  
  const [sourceData, setSourceData] = useState<SourceAccessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 EmissionFactorAccessManager: useEffect triggered');
    fetchSourceData();
  }, []); // Empty dependency array to run only once

  const fetchSourceData = async () => {
    try {
      console.log('🔄 EmissionFactorAccessManager: Starting to fetch source data...');
      setLoading(true);
      
      // Get all sources with their plan tier counts
      const { data, error } = await supabase
        .from('emission_factors')
        .select('source, plan_tier')
        .order('source');

      console.log('📊 EmissionFactorAccessManager: Raw data from database:', data);
      
      if (error) {
        console.error('❌ EmissionFactorAccessManager: Database error:', error);
        throw error;
      }

      // Group by source and calculate counts
      const sourceMap = new Map<string, SourceAccessData>();
      
      data?.forEach(item => {
        if (!sourceMap.has(item.source)) {
          sourceMap.set(item.source, {
            source: item.source,
            current_tier: 'standard',
            standard_count: 0,
            premium_count: 0,
            total_count: 0
          });
        }
        
        const sourceInfo = sourceMap.get(item.source)!;
        sourceInfo.total_count++;
        
        if (item.plan_tier === 'premium') {
          sourceInfo.premium_count++;
        } else {
          sourceInfo.standard_count++;
        }
      });

      // Determine current_tier based on the majority/consistency rule:
      // If ALL factors are premium, then source is premium, otherwise standard
      sourceMap.forEach(sourceInfo => {
        if (sourceInfo.premium_count > 0 && sourceInfo.standard_count === 0) {
          sourceInfo.current_tier = 'premium';
        } else {
          sourceInfo.current_tier = 'standard';
        }
      });

      console.log('🔧 EmissionFactorAccessManager: Processed sourceMap:', Array.from(sourceMap.entries()));
      
      const finalData = Array.from(sourceMap.values()).sort((a, b) => a.source.localeCompare(b.source));
      console.log('✅ EmissionFactorAccessManager: Final data to display:', finalData);
      
      setSourceData(finalData);
    } catch (error) {
      console.error('💥 EmissionFactorAccessManager: Error fetching source data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des sources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSourceTier = async (source: string, newTier: 'standard' | 'premium') => {
    try {
      console.log(`Starting update for source: ${source} to tier: ${newTier}`);
      setUpdating(source);
      
      // First, check how many records we're about to update
      const { data: countData, error: countError } = await supabase
        .from('emission_factors')
        .select('id, plan_tier')
        .eq('source', source);
      
      if (countError) {
        console.error('Error counting records:', countError);
        throw countError;
      }
      
      console.log(`Found ${countData?.length} records for source ${source}:`, countData);
      
      // Now update all records for this source
      const { data: updateData, error: updateError } = await supabase
        .from('emission_factors')
        .update({ plan_tier: newTier })
        .eq('source', source)
        .select('id, source, plan_tier'); // Return updated records to verify

      if (updateError) {
        console.error('Error updating records:', updateError);
        throw updateError;
      }

      console.log(`Successfully updated ${updateData?.length} records:`, updateData);

      // Refresh data to see changes
      await fetchSourceData();

      toast({
        title: "Succès",
        description: `Tous les facteurs de la source "${source}" ont été mis à jour vers ${newTier}`,
      });
    } catch (error) {
      console.error('Error updating source tier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le niveau d'accès",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    return tier === 'premium' ? 'default' : 'secondary';
  };

  const getTierIcon = (tier: string) => {
    return tier === 'premium' ? Crown : Shield;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion des Accès aux Sources de Données
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
          Gestion des Accès aux Sources de Données
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gérez les niveaux d'accès des sources de facteurs d'émission.
          <br />
          <span className="font-medium">Standard</span> : accessible à tous les utilisateurs
          <br />
          <span className="font-medium">Premium</span> : accessible uniquement aux utilisateurs premium
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Niveau actuel</TableHead>
              <TableHead>Facteurs Standard</TableHead>
              <TableHead>Facteurs Premium</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sourceData.map((source) => {
              const TierIcon = getTierIcon(source.current_tier);
              return (
                <TableRow key={source.source}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]" title={source.source}>
                        {source.source}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTierBadgeVariant(source.current_tier)}>
                      <TierIcon className="h-3 w-3 mr-1" />
                      {source.current_tier === 'premium' ? 'Premium' : 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{source.standard_count}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{source.premium_count}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{source.total_count}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {source.current_tier === 'standard' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSourceTier(source.source, 'premium')}
                          disabled={updating === source.source}
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Passer en Premium
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSourceTier(source.source, 'standard')}
                          disabled={updating === source.source}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Passer en Standard
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {sourceData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucune source de données trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};