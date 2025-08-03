import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Crown, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SourceAccessData {
  source: string;
  current_tier: 'standard' | 'premium';
  standard_count: number;
  premium_count: number;
  total_count: number;
}

interface UpdateState {
  [source: string]: {
    loading: boolean;
    success: boolean;
  };
}

export const EmissionFactorAccessManager = () => {
  const [sourceData, setSourceData] = useState<SourceAccessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateStates, setUpdateStates] = useState<UpdateState>({});
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { toast } = useToast();

  const fetchSourceData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Prevent redundant calls within 5 seconds unless forced
    if (!force && now - lastFetchTime < 5000) {
      console.log('⏱️ Skipping fetch - too recent');
      return;
    }

    try {
      console.log('🔄 EmissionFactorAccessManager: Fetching source data...');
      setLoading(true);
      setLastFetchTime(now);
      
      const { data, error } = await supabase
        .from('emission_factors')
        .select('source, plan_tier')
        .order('source');

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      // Process data
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

      // Determine tier based on majority
      sourceMap.forEach(sourceInfo => {
        sourceInfo.current_tier = sourceInfo.premium_count > sourceInfo.standard_count ? 'premium' : 'standard';
      });

      const finalData = Array.from(sourceMap.values());
      setSourceData(finalData);
      
      console.log('✅ Source data updated:', finalData.length, 'sources');
      
    } catch (error) {
      console.error('💥 Error fetching source data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des sources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime, toast]);

  const updateSourceTier = useCallback(async (source: string, newTier: 'standard' | 'premium') => {
    // Set loading state for this specific source
    setUpdateStates(prev => ({
      ...prev,
      [source]: { loading: true, success: false }
    }));

    try {
      console.log(`🚀 Starting update for source: ${source} to tier: ${newTier}`);
      
      // Count records before update
      const { data: countData, error: countError } = await supabase
        .from('emission_factors')
        .select('id', { count: 'exact' })
        .eq('source', source);
      
      if (countError) {
        console.error('❌ Error counting records:', countError);
        throw countError;
      }
      
      console.log(`📊 Found ${countData?.length || 0} records for source ${source}`);
      
      // Perform the update with timeout
      const updatePromise = supabase
        .from('emission_factors')
        .update({ plan_tier: newTier })
        .eq('source', source)
        .select('id, source, plan_tier');

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 30000)
      );

      const { data: updateData, error: updateError } = await Promise.race([
        updatePromise,
        timeoutPromise
      ]) as any;

      if (updateError) {
        console.error('❌ Error updating records:', updateError);
        throw updateError;
      }

      console.log(`✅ Successfully updated ${updateData?.length || 0} records`);

      // Mark as successful
      setUpdateStates(prev => ({
        ...prev,
        [source]: { loading: false, success: true }
      }));

      // Refresh data
      await fetchSourceData(true);

      toast({
        title: "Succès",
        description: `${updateData?.length || 0} facteurs de la source "${source}" mis à jour vers ${newTier}`,
      });

      // Clear success state after 3 seconds
      setTimeout(() => {
        setUpdateStates(prev => ({
          ...prev,
          [source]: { loading: false, success: false }
        }));
      }, 3000);

    } catch (error) {
      console.error('💥 Error updating source tier:', error);
      
      setUpdateStates(prev => ({
        ...prev,
        [source]: { loading: false, success: false }
      }));

      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le niveau d'accès",
        variant: "destructive",
      });
    }
  }, [fetchSourceData, toast]);

  useEffect(() => {
    fetchSourceData(true);
  }, [fetchSourceData]);

  const getTierBadgeVariant = (tier: string) => {
    return tier === 'premium' ? 'default' : 'secondary';
  };

  const getTierIcon = (tier: string) => {
    return tier === 'premium' ? Crown : Shield;
  };

  const getButtonContent = (source: SourceAccessData) => {
    const updateState = updateStates[source.source];
    
    if (updateState?.loading) {
      return (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Mise à jour...
        </>
      );
    }
    
    if (updateState?.success) {
      return (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          Terminé
        </>
      );
    }
    
    if (source.current_tier === 'standard') {
      return (
        <>
          <Crown className="h-3 w-3 mr-1" />
          Passer en Premium
        </>
      );
    } else {
      return (
        <>
          <Shield className="h-3 w-3 mr-1" />
          Passer en Standard
        </>
      );
    }
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchSourceData(true)}
            className="ml-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualiser
          </Button>
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
              const updateState = updateStates[source.source];
              
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
                    <Button
                      size="sm"
                      variant={updateState?.success ? "default" : "outline"}
                      onClick={() => updateSourceTier(
                        source.source, 
                        source.current_tier === 'standard' ? 'premium' : 'standard'
                      )}
                      disabled={updateState?.loading}
                    >
                      {getButtonContent(source)}
                    </Button>
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