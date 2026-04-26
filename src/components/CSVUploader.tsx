import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Upload, Terminal } from 'lucide-react';

interface TableSchema {
  table_name: string;
  columns: string[];
}

export const CSVUploader = ({ onSuccess }: { onSuccess: () => void }) => {
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [importType, setImportType] = useState<string>('');
  const [schemaError, setSchemaError] = useState<string>('');
  
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch dynamic schemas on mount
  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const { data, error } = await supabase.rpc('get_table_schemas');
        
        if (error || !data) {
          throw new Error(error?.message || "Function not found");
        }
        
        const sortedData = (data as TableSchema[]).sort((a, b) => a.table_name.localeCompare(b.table_name));
        setSchemas(sortedData);
        if (sortedData.length > 0) {
          setImportType(sortedData[0].table_name);
        }
      } catch (err: any) {
        setSchemaError("The dynamic schema function is missing in your database. Please run the SQL setup script provided in the walkthrough to enable dynamic table discovery.");
      }
    };
    
    fetchSchemas();
  }, []);

  const selectedSchema = schemas.find(s => s.table_name === importType);
  const expectedFields = selectedSchema?.columns || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setSuccess('');
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          setCsvData(results.data);
          
          // Auto-map identical headers
          const initialMapping: Record<string, string> = {};
          expectedFields.forEach(expected => {
            const match = results.meta.fields?.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_') === expected.toLowerCase());
            if (match) {
              initialMapping[expected] = match;
            }
          });
          setMapping(initialMapping);
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (!importType) return setError("Please select a target table.");
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const recordsToInsert = csvData.map(row => {
        const record: any = {};
        expectedFields.forEach(field => {
          const csvHeader = mapping[field];
          if (csvHeader && row[csvHeader] !== undefined && row[csvHeader] !== '') {
            let value = row[csvHeader];
            
            // Basic heuristic: if it looks like a pure number (and not an ID/name), parse it. 
            // Postgres will coerce most strings to text, but numerics need parsing.
            if (!isNaN(parseFloat(value)) && !value.match(/[a-zA-Z]/) && !field.includes('id') && !field.includes('name')) {
              value = parseFloat(value);
            }
            
            record[field] = value;
          }
        });
        return record;
      });

      // Filter out completely empty records
      const validRecords = recordsToInsert.filter(r => Object.keys(r).length > 0);

      if (validRecords.length === 0) {
        throw new Error('No valid records found after mapping.');
      }

      // Upsert into Supabase
      const { data, error: insertError } = await supabase
        .from(importType)
        .upsert(validRecords);

      if (insertError) throw insertError;

      setSuccess(`Successfully imported ${validRecords.length} records into '${importType}'!`);
      setFile(null);
      setCsvData([]);
      setCsvHeaders([]);
      setMapping({});
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  if (schemaError) {
    return (
      <Card className="w-full border-dashed border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-red-800 dark:text-red-300">Database Setup Required</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 max-w-lg">
                {schemaError}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Dynamic Bulk Import
        </CardTitle>
        <CardDescription>Upload a CSV file and dynamically map columns to any table.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-1 block">Target Table</label>
            <Select 
              value={importType} 
              onValueChange={(val) => { 
                setImportType(val); 
                setFile(null); 
                setCsvData([]); 
                setMapping({}); 
              }}
              disabled={schemas.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={schemas.length === 0 ? "Loading tables..." : "Select table"} />
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
          <div className="flex-1 w-full">
            <label className="text-sm font-medium mb-1 block">Upload CSV</label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              disabled={!importType}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200 disabled:opacity-50"
            />
          </div>
        </div>

        {importType && selectedSchema && csvHeaders.length === 0 && !error && !success && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-md p-4 text-sm">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">CSV Format Guide</h4>
            <p className="text-blue-700 dark:text-blue-400 mb-3">
              Your CSV file should ideally contain the following columns as the first row (header):
            </p>
            <div className="bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800 overflow-x-auto font-mono text-xs whitespace-nowrap text-slate-800 dark:text-slate-300">
              {expectedFields.join(',')}
            </div>
            <p className="text-blue-600 dark:text-blue-500 mt-2 text-xs">
              Note: You can still map columns manually after uploading if your CSV headers don't match exactly.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> <span className="break-all">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        {csvHeaders.length > 0 && selectedSchema && (
          <div className="space-y-4 border rounded-md p-4 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-medium text-sm flex justify-between items-center">
              <span>Map Columns to '{selectedSchema.table_name}'</span>
              <span className="text-xs font-normal text-muted-foreground">{selectedSchema.columns.length} columns available</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Match your CSV headers to the exact database fields for this table.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expectedFields.map(field => (
                <div key={field} className="flex flex-col gap-1 bg-white dark:bg-slate-900 p-2 rounded border shadow-sm">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 break-all">{field}</label>
                  <Select 
                    value={mapping[field] || 'ignore'} 
                    onValueChange={(val) => setMapping(prev => ({ ...prev, [field]: val === 'ignore' ? '' : val }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Ignore" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ignore">-- Ignore --</SelectItem>
                      {csvHeaders.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <Button onClick={handleImport} disabled={loading || csvData.length === 0}>
                {loading ? 'Importing...' : `Import ${csvData.length} Records to ${importType}`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
