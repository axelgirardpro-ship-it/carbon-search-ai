import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Import = () => {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvTemplate = [
      "nom,description,fe,unite,source,secteur,categorie,localisation,date,incertitude",
      "Exemple Verre,Description du facteur d'émission,1.62,kgCO2e/kg,Base Impacts 3.0,Matériaux,Verre,Europe,2023,±15%",
      "Exemple Acier,Facteur d'émission pour l'acier,2.5,kgCO2e/kg,ADEME,Matériaux,Métaux,France,2023,±20%"
    ].join("\n");
    
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_facteurs_emissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV valide",
        variant: "destructive"
      });
    }
  };

  const handleUpload = () => {
    if (!file || !datasetName.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un fichier et donner un nom à votre dataset",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Import réussi",
        description: `Le dataset "${datasetName}" a été importé avec succès`,
      });
      
      // Reset form
      setFile(null);
      setDatasetName("");
      setAddToFavorites(false);
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Upload className="w-8 h-8 mr-3 text-primary" />
              Import de données
            </h1>
            <p className="text-muted-foreground">
              Importez votre propre base de données de facteurs d'émissions carbone
            </p>
          </div>

          {/* Template Download Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Télécharger le template
              </CardTitle>
              <CardDescription>
                Utilisez notre template CSV pour formater correctement vos données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-muted-foreground mr-3" />
                  <div>
                    <div className="font-medium">template_facteurs_emissions.csv</div>
                    <div className="text-sm text-muted-foreground">Template avec colonnes requises</div>
                  </div>
                </div>
                <Button onClick={downloadTemplate} variant="outline">
                  Télécharger
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <strong>Colonnes requises :</strong> nom, description, fe, unite, source, secteur, 
                categorie, localisation, date, incertitude
              </div>
            </CardContent>
          </Card>

          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Importer votre dataset</CardTitle>
              <CardDescription>
                Sélectionnez un fichier CSV formaté selon notre template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dataset-name">Nom du dataset</Label>
                <Input
                  id="dataset-name"
                  placeholder="Mon dataset personnalisé"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Fichier CSV</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <div className="text-lg font-medium mb-2">
                        Cliquez pour sélectionner un fichier
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Formats acceptés : CSV uniquement
                      </div>
                    </div>
                  )}
                  
                  <label
                    htmlFor="file-upload"
                    className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                  >
                    {file ? "Changer de fichier" : "Sélectionner un fichier"}
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add-favorites"
                  checked={addToFavorites}
                  onCheckedChange={(checked) => setAddToFavorites(checked as boolean)}
                />
                <Label htmlFor="add-favorites" className="text-sm">
                  Ajouter automatiquement tous les éléments de ce dataset à mes favoris
                </Label>
              </div>

              <Button 
                onClick={handleUpload} 
                className="w-full" 
                disabled={!file || !datasetName.trim() || isUploading}
              >
                {isUploading ? "Import en cours..." : "Importer le dataset"}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <div><strong>Limite de taille :</strong> 10 MB maximum par fichier</div>
                <div><strong>Format :</strong> CSV avec séparateur virgule (,)</div>
                <div><strong>Encodage :</strong> UTF-8 recommandé</div>
                <div><strong>Validation :</strong> Les données seront vérifiées avant import</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Import;