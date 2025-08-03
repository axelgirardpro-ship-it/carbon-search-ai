import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Shield, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Contact {
  id: string;
  user_id: string;
  workspace_id: string;
  role: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  company_plan?: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
}

export const ContactsTable = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
    fetchContacts();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Use edge function to get contacts with admin privileges
      const { data, error } = await supabase.functions.invoke('get-admin-contacts', {
        body: { workspaceId: selectedCompany }
      });

      if (error) throw error;

      if (data?.data) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'premium': return 'default';
      case 'standard': return 'secondary';
      case 'freemium': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'gestionnaire': return 'default';
      case 'lecteur': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'gestionnaire': return 'Gestionnaire';
      case 'lecteur': return 'Lecteur';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contacts par Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
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
          <User className="h-5 w-5" />
          Contacts par Entreprise ({contacts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrer par entreprise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entreprises</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Ajouté le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {contact.first_name || contact.last_name ? 
                      `${contact.first_name} ${contact.last_name}`.trim() : 
                      'Nom non renseigné'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {contact.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {contact.company_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPlanBadgeVariant(contact.company_plan || 'freemium')}>
                    {contact.company_plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <Badge variant={getRoleBadgeVariant(contact.role)}>
                      {getRoleLabel(contact.role)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun contact trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};