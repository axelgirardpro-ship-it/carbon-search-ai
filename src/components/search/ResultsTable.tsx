import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Heart, Download, ChevronDown } from "lucide-react";
import { EmissionFactor } from "@/types/emission-factor";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  results: EmissionFactor[];
  selectedItems: string[];
  onItemSelect: (id: string) => void;
  onSelectAll: () => void;
  onToggleFavorite: (id: string) => void;
  onExport: () => void;
  isLoading?: boolean;
}

export const ResultsTable = ({
  results,
  selectedItems,
  onItemSelect,
  onSelectAll,
  onToggleFavorite,
  onExport,
  isLoading = false
}: ResultsTableProps) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;
  
  // Reset page when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (results.length <= ITEMS_PER_PAGE) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // Show first page
      pages.push(1);
      
      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        pages.push('ellipsis-start');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        pages.push('ellipsis-end');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {typeof page === 'number' ? (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-950 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 opacity-20">
          {/* Empty state illustration */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
        <p className="text-muted-foreground">
          Essayez de modifier vos critères de recherche ou de supprimer certains filtres
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-table-container>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={selectedItems.length === results.length}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.length} sélectionné(s) sur {results.length} résultat(s)
            {results.length > ITEMS_PER_PAGE && (
              <span className="ml-2">
                (Affichage de {startIndex + 1}-{Math.min(endIndex, results.length)} sur {results.length})
              </span>
            )}
          </span>
        </div>
        
        {selectedItems.length > 0 && (
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter la sélection
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>FE</TableHead>
              <TableHead>Unité donnée d'activité</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentResults.map((item) => (
              <>
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => onItemSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="flex items-center gap-2">
                      <div className="truncate">{item.nom}</div>
                      {(item as any).source_type === 'private' && (
                        <Badge variant="secondary" className="text-xs">Import</Badge>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {item.fe}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.uniteActivite}</Badge>
                  </TableCell>
                  <TableCell>{item.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span>{item.localisation}</span>
                      {expandedRows.includes(item.id) && (
                        <ChevronDown className="h-4 w-4 rotate-180" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onToggleFavorite(item.id)}
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4",
                          item.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                        )} 
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRowExpansion(item.id)}
                    >
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedRows.includes(item.id) && "rotate-180"
                        )} 
                      />
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.includes(item.id) && (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-muted/20">
                       <div className="p-4 space-y-3">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                           <div>
                             <span className="font-medium">Nom: </span>
                             {item.nom}
                           </div>
                           <div>
                             <span className="font-medium">FE: </span>
                             {item.fe}
                           </div>
                           <div>
                             <span className="font-medium">Unité donnée d'activité: </span>
                             {item.uniteActivite}
                           </div>
                           <div>
                             <span className="font-medium">Source: </span>
                             {item.source}
                           </div>
                           <div>
                             <span className="font-medium">Secteur: </span>
                             {item.secteur}
                           </div>
                           <div>
                             <span className="font-medium">Sous-secteur: </span>
                             {item.sousSecteur || "N/A"}
                           </div>
                           <div>
                             <span className="font-medium">Date: </span>
                             {item.date}
                           </div>
                           <div>
                             <span className="font-medium">Localisation: </span>
                             {item.localisation}
                           </div>
                           <div>
                             <span className="font-medium">Incertitude: </span>
                             {item.incertitude || "N/A"}
                           </div>
                           <div>
                             <span className="font-medium">Périmètre: </span>
                             {item.perimetre || "N/A"}
                           </div>
                           <div>
                             <span className="font-medium">Contributeur: </span>
                             {item.contributeur || "N/A"}
                           </div>
                           <div>
                             <span className="font-medium">Commentaires: </span>
                             {item.commentaires || "N/A"}
                           </div>
                         </div>
                         {item.description && (
                           <div className="text-sm">
                             <span className="font-medium">Description: </span>
                             {item.description}
                           </div>
                         )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {renderPagination()}
    </div>
  );
};