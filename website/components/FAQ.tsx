'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item, index) => (
        <Accordion.Item
          key={index}
          value={`item-${index}`}
          className="rounded-xl bg-navy-800/50 border border-white/5 overflow-hidden"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex items-center justify-between w-full px-6 py-5 text-left text-white font-medium hover:bg-white/[0.02] transition-colors group">
              <span className="pr-4">{item.question}</span>
              <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-[slideDown_200ms_ease-out] data-[state=closed]:animate-[slideUp_200ms_ease-out]">
            <div className="px-6 pb-5 text-slate-400 leading-relaxed">
              {item.answer}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
