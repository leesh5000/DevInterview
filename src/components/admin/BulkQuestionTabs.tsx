"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileJson } from "lucide-react";
import { Category, TargetRole } from "@/types";
import BulkQuestionForm from "./BulkQuestionForm";
import JsonBulkQuestionForm from "./JsonBulkQuestionForm";

interface BulkQuestionTabsProps {
  categories: Category[];
  targetRoles: TargetRole[];
}

export default function BulkQuestionTabs({
  categories,
  targetRoles,
}: BulkQuestionTabsProps) {
  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="json" className="gap-2">
          <FileJson className="w-4 h-4" />
          JSON 파일 업로드
        </TabsTrigger>
        <TabsTrigger value="text" className="gap-2">
          <FileText className="w-4 h-4" />
          텍스트 파싱
        </TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonBulkQuestionForm
          categories={categories}
          targetRoles={targetRoles}
        />
      </TabsContent>
      <TabsContent value="text">
        <BulkQuestionForm
          categories={categories}
          targetRoles={targetRoles}
        />
      </TabsContent>
    </Tabs>
  );
}
