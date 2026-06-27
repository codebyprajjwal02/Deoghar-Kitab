import { motion } from "framer-motion";
import { Wallet, Recycle, Users, ShieldCheck, Clock, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChoose = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Wallet,
      title: t.whyChoose.saveMoney,
      description: t.whyChoose.saveMoneyDesc,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      icon: Recycle,
      title: t.whyChoose.declutter,
      description: t.whyChoose.declutterDesc,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      icon: Users,
      title: t.whyChoose.community,
      description: t.whyChoose.communityDesc,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: ShieldCheck,
      title: "Verified Sellers",
      description: "Every seller is verified by our team for a safe and trustworthy buying experience.",
      color: "from-purple-500 to-violet-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your books delivered quickly so you never miss a study session.",
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      icon: Headphones,
      title: "Student Support",
      description: "Dedicated support team to help students with any queries 7 days a week.",
      color: "from-teal-500 to-cyan-600",
      bg: "bg-teal-50",
      border: "border-teal-100",
    },
  ];

  const stats = [
    { value: "₹500", label: "Avg. Savings Per Book" },
    { value: "48hr", label: "Avg. Delivery Time" },
    { value: "100%", label: "Verified Listings" },
    { value: "24/7", label: "Student Support" },
  ];

  return (
    <section id="why" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <ShieldCheck className="w-4 h-4" />
            Why Students Love Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 section-title">
            {t.whyChoose.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.whyChoose.subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className={`group bg-card border ${feature.border} rounded-2xl p-7 shadow-card hover:shadow-hover transition-all duration-300`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "var(--gradient-stats)" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                viewport={{ once: true }}
                className="text-center py-10 px-6"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 animate-count-up">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChoose;
