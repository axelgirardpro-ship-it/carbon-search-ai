import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, ChevronDown } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

export const WorkspaceSelector = () => {
  const { currentWorkspace, workspaces, switchWorkspace, createWorkspace, loading } = useWorkspace();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer un nom pour le workspace",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newWorkspace = await createWorkspace(newWorkspaceName.trim());
      if (newWorkspace) {
        toast({
          title: "Workspace créé",
          description: `Le workspace "${newWorkspaceName}" a été créé avec succès`,
        });
        setIsCreateDialogOpen(false);
        setNewWorkspaceName("");
        switchWorkspace(newWorkspace.id);
      } else {
        throw new Error("Erreur lors de la création du workspace");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le workspace",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Building2 className="w-4 h-4" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Créer un workspace
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau workspace</DialogTitle>
            <DialogDescription>
              Créez un workspace pour organiser vos données et collaborer avec votre équipe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Nom du workspace</Label>
              <Input
                id="workspace-name"
                placeholder="Mon Entreprise"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateWorkspace();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewWorkspaceName("");
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={isCreating}>
              {isCreating ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />
      <Select value={currentWorkspace.id} onValueChange={switchWorkspace}>
        <SelectTrigger className="w-[200px] h-8 text-sm">
          <SelectValue placeholder="Sélectionner un workspace">
            {currentWorkspace.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center justify-between w-full">
                <span>{workspace.name}</span>
                {workspace.plan_type !== 'freemium' && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-1 rounded">
                    {workspace.plan_type}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          <div className="border-t border-border mx-1 my-1" />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau workspace
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau workspace</DialogTitle>
                <DialogDescription>
                  Créez un workspace pour organiser vos données et collaborer avec votre équipe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Nom du workspace</Label>
                  <Input
                    id="workspace-name"
                    placeholder="Mon Entreprise"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateWorkspace();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewWorkspaceName("");
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateWorkspace} disabled={isCreating}>
                  {isCreating ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
    </div>
  );
};