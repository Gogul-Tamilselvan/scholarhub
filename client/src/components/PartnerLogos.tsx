import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PartnerLogos() {
  const partners = [
    { name: "Open Access", logo: "🔓" },
    { name: "ISSN", logo: "📰" },
    { name: "ISBN", logo: "📚" },
    { name: "Creative Commons", logo: "🅭" },
    { name: "No Plagiarism", logo: "✓" },
    { name: "DOI CrossRef", logo: "🔗" },
    { name: "COPE", logo: "⚖️" }
  ];

  return (
    <section className="w-full py-12 bg-blue-50 dark:bg-blue-950/20 pt-[0px] pb-[0px]">
      <div className="max-w-7xl mx-auto px-6 pt-[4px] pb-[4px] bg-[#ffffff]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center bg-blue-50 dark:bg-blue-950/20">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <CardTitle className="text-3xl font-serif text-blue-900 dark:text-blue-300 mb-4">
                  Our Certifications & Partners
                </CardTitle>
                <p className="text-gray-700 dark:text-gray-300 text-center">
                  Committed to maintaining the highest standards of academic publishing
                </p>
              </motion.div>
            </CardHeader>
            <CardContent className="p-8">
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-7 gap-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.05 }}
                viewport={{ once: true }}
              >
                {partners.map((partner, index) => (
                  <motion.div 
                    key={index}
                    className="flex flex-col items-center p-4 border-2 border-blue-200 dark:border-blue-800 rounded-md hover-elevate cursor-pointer bg-blue-50 dark:bg-blue-950/20 transition-all"
                    data-testid={`partner-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div 
                      className="text-4xl mb-2"
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {partner.logo}
                    </motion.div>
                    <span className="text-sm font-medium text-center text-blue-900 dark:text-blue-300">{partner.name}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  Our commitment to quality is reflected in our adherence to international 
                  publishing standards and ethical guidelines.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
