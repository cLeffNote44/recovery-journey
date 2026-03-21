import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  loadTrash,
  removeFromTrash,
  emptyTrash,
  getItemTypeDisplayName,
  getItemTitle,
  getDaysUntilExpiry,
  groupTrashByType,
  type TrashItem,
  type TrashItemType
} from '@/lib/trash-system';
import { toast } from 'sonner';

interface TrashBinProps {
  onRestore: (type: TrashItemType, data: any) => void;
}

export function TrashBin({ onRestore }: TrashBinProps) {
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [expandedTypes, setExpandedTypes] = useState<Set<TrashItemType>>(new Set());

  useEffect(() => {
    setTrash(loadTrash());
  }, []);

  const handleRestore = (item: TrashItem) => {
    const removed = removeFromTrash(item.id);
    if (removed) {
      onRestore(item.type, item.data);
      setTrash(loadTrash());
      toast.success(`${getItemTypeDisplayName(item.type)} restored`);
    }
  };

  const handlePermanentDelete = (item: TrashItem) => {
    if (!confirm(`Permanently delete this ${getItemTypeDisplayName(item.type)}? This cannot be undone.`)) {
      return;
    }

    removeFromTrash(item.id);
    setTrash(loadTrash());
    toast.success('Item permanently deleted');
  };

  const handleEmptyTrash = () => {
    if (!confirm(`Permanently delete all ${trash.length} items? This cannot be undone.`)) {
      return;
    }

    emptyTrash();
    setTrash([]);
    toast.success('Trash emptied');
  };

  const toggleExpanded = (type: TrashItemType) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const groupedTrash = groupTrashByType(trash);
  const types = Object.keys(groupedTrash) as TrashItemType[];

  if (trash.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Trash Bin
          </CardTitle>
          <CardDescription>
            Deleted items are kept for 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Trash is empty</p>
            <p className="text-sm mt-2">Deleted items will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Trash Bin
            </CardTitle>
            <CardDescription>
              {trash.length} item{trash.length !== 1 ? 's' : ''} - auto-deleted after 30 days
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmptyTrash}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Empty
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {types.map(type => {
          const items = groupedTrash[type];
          const isExpanded = expandedTypes.has(type);

          return (
            <div key={type} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleExpanded(type)}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="font-medium">
                  {getItemTypeDisplayName(type)} ({items.length})
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isExpanded && (
                <div className="divide-y">
                  {items.map(item => {
                    const daysLeft = getDaysUntilExpiry(item);
                    const isExpiringSoon = daysLeft <= 7;

                    return (
                      <div
                        key={item.id}
                        className="p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {getItemTitle(item)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Deleted {new Date(item.deletedAt).toLocaleDateString()}
                            </span>
                            {isExpiringSoon && (
                              <span className="flex items-center gap-1 text-xs text-amber-500">
                                <Clock className="w-3 h-3" />
                                {daysLeft}d left
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRestore(item)}
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handlePermanentDelete(item)}
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            Items are automatically deleted after 30 days. Restore them before they expire.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
