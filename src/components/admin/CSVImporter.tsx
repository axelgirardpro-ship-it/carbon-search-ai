import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, CheckCircle, XCircle, AlertTriangle, Download, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

interface ImportResult {
  importId: string;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
}

export const CSVImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const { canImportData, role } = usePermissions();

  console.log('CSVImporter - User role:', role, 'Can import:', canImportData);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV valide",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive",
      });
      return;
    }

    try {
      setImporting(true);
      setProgress(0);
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('replaceExisting', replaceExisting.toString());

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Session d\'authentification expirée. Veuillez vous reconnecter.');
      }

      console.log('Calling import-csv function with token:', session.access_token.substring(0, 20) + '...');
      
      const { data, error } = await supabase.functions.invoke('import-csv', {
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('Function response:', { data, error });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "Import terminé",
        description: `${data.recordsInserted} enregistrements importés avec succès`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error.message || "Une erreur est survenue lors de l'import",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (progress < 100) setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['nom', 'description', 'fe', 'unite', 'secteur', 'categorie', 'source', 'localisation', 'date', 'incertitude'],
      ['Transport routier - Voiture particulière essence', 'Facteur d\'émission pour voiture particulière essence', '0.193', 'kg CO2e/km', 'Transport', 'Transport routier', 'ADEME 2024', 'France', '2024', '±15%'],
      ['Électricité - Mix énergétique français', 'Facteur d\'émission du mix électrique français', '0.079', 'kg CO2e/kWh', 'Énergie', 'Électricité', 'RTE 2024', 'France', '2024', '±10%'],
      ['Gaz naturel - Combustion', 'Facteur d\'émission pour la combustion de gaz naturel', '0.234', 'kg CO2e/kWh', 'Énergie', 'Gaz', 'ADEME 2024', 'France', '2024', '±5%']
    ];
    
    const csvContent = templateData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_emission_factors.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template téléchargé",
      description: "Le fichier template CSV a été téléchargé avec succès",
    });
  };

  const resetImport = () => {
    setFile(null);
    setProgress(0);
    setResult(null);
    setReplaceExisting(false);
  };

  const exportEmissionFactors = async () => {
    try {
      setExporting(true);
      
      toast({
        title: "Export en cours",
        description: "Récupération des données depuis la base...",
      });

      // Récupérer toutes les données de la table emission_factors
      const { data, error } = await supabase
        .from('emission_factors')
        .select('*')
        .order('source', { ascending: true });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucun facteur d'émission trouvé dans la base de données",
          variant: "destructive",
        });
        return;
      }

      // Créer le contenu CSV
      const headers = [
        'nom', 'description', 'fe', 'unite', 'secteur', 'categorie', 
        'source', 'localisation', 'date', 'incertitude'
      ];

      const csvRows = [
        headers.join(','), // En-têtes
        ...data.map(row => [
          `"${row["Nom"] || ''}"`,
          `"${row["Description"] || ''}"`,
          row["FE"] || 0,
          `"${row["Unité donnée d'activité"] || ''}"`,
          `"${row["Secteur"] || ''}"`,
          `"${row["Sous-secteur"] || ''}"`,
          `"${row["Source"] || ''}"`,
          `"${row["Localisation"] || ''}"`,
          `"${row["Date"] || ''}"`,
          `"${row["Incertitude"] || ''}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `emission_factors_export_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export terminé",
        description: `${data.length} facteurs d'émission exportés dans ${filename}`,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: error.message || "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Vérification des permissions
  if (!canImportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import / Export de Données CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Accès restreint</div>
                <div>Vous n'avez pas les permissions nécessaires pour importer des données.</div>
                <div className="text-sm text-muted-foreground">
                  Votre rôle actuel : <span className="font-medium">{role}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Rôles autorisés : Administrateur, Gestionnaire, Supra Administrateur
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import / Export de Données CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Étapes claires pour l'utilisateur */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="font-medium text-sm">Guide d'utilisation :</div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</span>
              Sélectionnez un fichier CSV ci-dessous
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-muted border-2 border-muted-foreground rounded-full flex items-center justify-center text-xs font-medium">2</span>
              Cliquez sur "Importer" (le bouton devient actif après sélection)
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="csv-file">Fichier CSV</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
          {!file && (
            <div className="text-sm text-muted-foreground">
              ⚠️ Veuillez d'abord sélectionner un fichier CSV pour activer le bouton d'import
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="replace-existing"
            checked={replaceExisting}
            onCheckedChange={setReplaceExisting}
            disabled={importing}
          />
          <Label htmlFor="replace-existing">
            Remplacer toutes les données existantes
          </Label>
        </div>

        {replaceExisting && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Attention : Cette action supprimera toutes les données existantes dans la base de données avant d'importer les nouvelles données.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleImport} 
            disabled={!file || importing || exporting}
            className="flex items-center gap-2"
            title={!file ? "Sélectionnez d'abord un fichier CSV" : ""}
          >
            <Upload className="h-4 w-4" />
            {importing ? "Import en cours..." : "Importer"}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={downloadTemplate}
            disabled={importing || exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger Template
          </Button>

          <Button 
            variant="outline" 
            onClick={exportEmissionFactors}
            disabled={importing || exporting}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            {exporting ? "Export en cours..." : "Exporter BDD"}
          </Button>
          
          {(file || result) && (
            <Button 
              variant="outline" 
              onClick={resetImport}
              disabled={importing || exporting}
            >
              Réinitialiser
            </Button>
          )}
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Import en cours...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <File className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">Traités</div>
                  <div className="text-lg font-bold text-blue-600">
                    {result.recordsProcessed}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium">Importés</div>
                  <div className="text-lg font-bold text-green-600">
                    {result.recordsInserted}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Upload className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-sm font-medium">Mis à jour</div>
                  <div className="text-lg font-bold text-orange-600">
                    {result.recordsUpdated}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-sm font-medium">Échecs</div>
                  <div className="text-lg font-bold text-red-600">
                    {result.recordsFailed}
                  </div>
                </div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Erreurs détectées :</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>... et {result.errors.length - 5} autres erreurs</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-3">
          <div>
            <div className="font-medium mb-2">Format CSV attendu :</div>
            <div className="font-mono text-xs bg-muted p-2 rounded">
              nom,description,fe,unite,secteur,categorie,source,localisation,date,incertitude
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2">Notes importantes :</div>
            <div className="text-xs space-y-1">
              <div>• Les données importées sont automatiquement privées à votre workspace</div>
              <div>• L'accès premium/standard est géré par les sources globales</div>
              <div>• Les colonnes plan_tier et is_public ne sont plus utilisées</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};