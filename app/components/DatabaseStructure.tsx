import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DatabaseStructureProps {
  dbStructure: {[key: string]: string[]} | null;
}

export function DatabaseStructure({ dbStructure }: DatabaseStructureProps) {
  const [isDbStructureOpen, setIsDbStructureOpen] = useState(true);

  if (!dbStructure) return null;

  return (
    <Collapsible
      open={isDbStructureOpen}
      onOpenChange={setIsDbStructureOpen}
      className="mt-4"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex justify-between w-full">
          Database Structure
          <motion.div
            initial={false}
            animate={{ rotate: isDbStructureOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {isDbStructureOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CollapsibleContent className="mt-2">
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <motion.div 
                  className="p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {Object.entries(dbStructure).map(([tableName, columns]) => (
                    <Card key={tableName} className="mb-4">
                      <CardContent className="pt-4">
                        <h3 className="text-sm font-semibold mb-2">{tableName}</h3>
                        <ul className="text-sm list-disc list-inside">
                          {columns.map((column) => (
                            <li key={column}>{column}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </ScrollArea>
            </CollapsibleContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}