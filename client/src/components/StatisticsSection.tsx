import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RefreshCw, Send, Languages } from "lucide-react";

const stats = [
  { title: "Journal Frequency", value: "Quarterly", icon: RefreshCw },
  { title: "Submission", value: "Ongoing", icon: Send },
  { title: "Accepted Language", value: "English", icon: Languages },
];

export default function StatisticsSection() {
  return (
    <section className="w-full py-10 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-serif font-bold text-center text-white bg-[#213361] py-4 rounded-md shadow-sm mb-8">
            Publication Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <Icon className="h-6 w-6 text-[#213361] dark:text-blue-300" />
                      </div>
                      <h3 className="font-semibold text-base text-blue-900 dark:text-blue-300">
                        {stat.title}
                      </h3>
                      <motion.p
                        className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                        initial={{ scale: 0.8 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.15 }}
                        viewport={{ once: true }}
                      >
                        {stat.value}
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
