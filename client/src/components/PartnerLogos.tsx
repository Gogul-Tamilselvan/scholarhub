import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Unlock, Hash, BookMarked, Scale, ShieldCheck, Link2, Fingerprint } from "lucide-react";

const partners = [
  { name: "Open Access", icon: Unlock },
  { name: "ISSN", icon: Hash },
  { name: "ISBN", icon: BookMarked },
  { name: "Creative Commons", icon: Fingerprint },
  { name: "No Plagiarism", icon: ShieldCheck },
  { name: "DOI CrossRef", icon: Link2 },
  { name: "COPE", icon: Scale },
];

export default function PartnerLogos() {
  return (
    <section className="w-full py-10 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <CardHeader className="bg-[#213361] text-white text-center py-5">
              <CardTitle className="text-2xl font-serif text-white">
                Our Certifications &amp; Partners
              </CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                Committed to maintaining the highest standards of academic publishing
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {partners.map((partner, index) => {
                  const Icon = partner.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center gap-2 p-4 rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 hover-elevate cursor-default"
                      data-testid={`partner-${index}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <div className="p-2 rounded-full bg-[#213361] dark:bg-blue-800">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-center text-blue-900 dark:text-blue-300 leading-tight">
                        {partner.name}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.p
                className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Our commitment to quality is reflected in our adherence to international
                publishing standards and ethical guidelines.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
