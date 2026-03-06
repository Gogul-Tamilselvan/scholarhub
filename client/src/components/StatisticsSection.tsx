import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatisticsSection() {
  const stats = [
    { title: "Journal Frequency", value: "Quarterly" },
    { title: "Submission", value: "Ongoing" },
    { title: "Accepted Language", value: "English" }
  ];

  return (
    <section className="w-full py-12 bg-blue-50 dark:bg-blue-950/20 pt-[4px] pb-[4px]">
      <div className="max-w-7xl mx-auto px-6 pt-[8px] pb-[8px] bg-[#fafafa]">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif font-bold dark:text-white mb-4 bg-[#213361] text-[#ffffff] py-4 rounded-md shadow-md">
            Publication Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8 px-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 h-full">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-300">{stat.title}</h3>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900 dark:text-gray-200"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.15 }}
                      viewport={{ once: true }}
                    >
                      {stat.value}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
