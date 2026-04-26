import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface TableSchema {
  table_name: string;
  columns: string[];
}

export const DynamicTableEditor = () => {
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const fetchSchemas = async () => {
      const { data: rawData, error } = await supabase.rpc('get_table_schemas');
      if (!error && rawData) {
        const sortedData = (rawData as TableSchema[]).sort((a, b) => a.table_name.localeCompare(b.table_name));
        setSchemas(sortedData);
        if (sortedData.length > 0) {
          setSelectedTable(sortedData[0].table_name);
        }
      }
    };
    fetchSchemas();
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      const { data: rows, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('id', { ascending: true }) // assuming there is an ID
        .limit(100); // limit to 100 for safety, could add pagination later
        
      setLoading(false);
      
      if (error) {
        // Fallback if there is no 'id' column to order by
        if (error.code === 'PGRST100') {
           const { data: rowsFallback, error: fallbackError } = await supabase
             .from(selectedTable)
             .select('*')
             .limit(100);
           if (!fallbackError) setData(rowsFallback || []);
           else setError(fallbackError.message);
        } else {
          setError(error.message);
        }
      } else {
        setData(rows || []);
      }
    };
    
    fetchData();
  }, [selectedTable]);

  const activeSchema = schemas.find(s => s.table_name === selectedTable);
  const columns = activeSchema?.columns || [];

  const handleDoubleClick = (id: string, field: string, currentValue: any) => {
    // If there's no ID, we can't reliably update
    if (!id) return setError("Cannot edit row without an 'id' column.");
    
    setEditingCell({ id, field });
    setEditValue(currentValue === null || currentValue === undefined ? '' : String(currentValue));
  };

  const saveEdit = async () => {
    if (!editingCell || !selectedTable) return;
    
    const { id, field } = editingCell;
    setEditingCell(null);
    
    const originalRow = data.find(r => r.id === id);
    if (!originalRow || String(originalRow[field]) === editValue) return; // No change

    // Try to parse number if it looks like one, to avoid type mismatch
    let finalValue: any = editValue;
    if (!isNaN(parseFloat(editValue)) && !editValue.match(/[a-zA-Z]/) && !field.includes('name') && !field.includes('id')) {
      finalValue = parseFloat(editValue);
    }
    
    // Update local state optimistically
    setData(prev => prev.map(row => row.id === id ? { ...row, [field]: finalValue } : row));
    
    const { error } = await supabase
      .from(selectedTable)
      .update({ [field]: finalValue })
      .eq('id', id);
      
    if (error) {
      setError(`Failed to update ${field}: ${error.message}`);
      // Revert optimistic update
      setData(prev => prev.map(row => row.id === id ? { ...row, [field]: originalRow[field] } : row));
    } else {
      setSuccess("Cell updated successfully");
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

  return (
    <Card className="w-full flex flex-col h-[calc(100vh-220px)]">
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Spreadsheet View
            </CardTitle>
            <CardDescription>Select a table to view and edit data inline (Double-click a cell to edit).</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 min-w-[200px]">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {schemas.map(schema => (
                  <SelectItem key={schema.table_name} value={schema.table_name}>
                    {schema.table_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        
        {success && (
          <div className="mt-3 p-2 bg-green-50 text-green-700 rounded text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 overflow-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        
        {data.length === 0 && !loading ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
            <Database className="w-12 h-12 mb-4 opacity-20" />
            <p>No data found in {selectedTable}</p>
          </div>
        ) : (
          <Table className="relative">
            <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 shadow-sm z-20">
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col} className="whitespace-nowrap font-semibold border-x border-slate-100 dark:border-slate-800">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={row.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {columns.map(col => {
                    const isEditing = editingCell?.id === row.id && editingCell?.field === col;
                    
                    return (
                      <TableCell 
                        key={col} 
                        className={`border-x border-slate-100 dark:border-slate-800 p-0 relative ${col === 'id' ? 'bg-slate-50 dark:bg-slate-900/50 text-muted-foreground cursor-not-allowed' : 'cursor-text hover:bg-blue-50/50 dark:hover:bg-blue-900/20'}`}
                        onDoubleClick={() => col !== 'id' && handleDoubleClick(row.id, col, row[col])}
                      >
                        {isEditing ? (
                          <Input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 h-full w-full rounded-none border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 z-10 bg-white dark:bg-slate-950"
                          />
                        ) : (
                          <div className="px-4 py-3 min-h-[44px] flex items-center whitespace-nowrap truncate max-w-[300px]">
                            {row[col] === null ? <span className="text-muted-foreground italic text-xs">null</span> : String(row[col])}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
