import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

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

      const { data, error } = await supabase.functions.invoke('import-csv', {
        body: formData,
      });

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

  const resetImport = () => {
    setFile(null);
    setProgress(0);
    setResult(null);
    setReplaceExisting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import de Données CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={!file || importing}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {importing ? "Import en cours..." : "Importer"}
          </Button>
          
          {(file || result) && (
            <Button 
              variant="outline" 
              onClick={resetImport}
              disabled={importing}
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

        <div className="text-sm text-muted-foreground">
          <div className="font-medium mb-2">Format CSV attendu :</div>
          <div className="font-mono text-xs bg-muted p-2 rounded">
            nom,description,fe,unite,secteur,categorie,source,localisation,date,incertitude,plan_tier,is_public
          </div>
        </div>
      </CardContent>
    </Card>
  );
};