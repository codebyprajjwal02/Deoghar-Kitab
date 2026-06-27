import { motion } from "framer-motion";
import { Star, Quote, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "B.Sc Student, Deoghar College",
    avatar: "P",
    color: "from-pink-500 to-rose-500",
    content: "Saved over ₹2,000 on NCERT textbooks this semester! The books were in excellent condition and arrived super fast. Highly recommend!",
    rating: 5,
    saved: "₹2,000 saved",
  },
  {
    name: "Rahul Kumar",
    role: "Competitive Exam Aspirant",
    avatar: "R",
    color: "from-amber-500 to-orange-500",
    content: "Selling my old JEE prep books was so easy! Listed them in minutes and got paid within a week. This platform is a lifesaver.",
    rating: 5,
    saved: "₹3,500 earned",
  },
  {
    name: "Anjali Verma",
    role: "Literature Student, Delhi",
    avatar: "A",
    color: "from-blue-500 to-indigo-600",
    content: "Finally found rare classics I'd been searching for years. The community here truly loves books and everyone is so helpful.",
    rating: 5,
    saved: "₹1,800 saved",
  },
];

const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden" style={{ background: "var(--gradient-section)" }}>
      {/* Background orbs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-green-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <MessageSquare className="w-4 h-4" />
            Student Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 section-title">
            {t.testimonials.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="bg-card rounded-2xl p-7 shadow-card hover:shadow-hover transition-all duration-300 relative border border-border/50 flex flex-col"
            >
              {/* Quote decoration */}
              <div className={`absolute top-5 right-5 w-10 h-10 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center opacity-15`}>
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/80 leading-relaxed text-sm mb-6 flex-1">
                "{testimonial.content}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
                {/* Savings badge */}
                <span className="savings-badge whitespace-nowrap">
                  {testimonial.saved}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden text-center py-14 px-6"
          style={{ background: "var(--gradient-brand)" }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Join 1,200+ Students Saving on Books
          </h3>
          <p className="text-white/80 mb-8 text-lg max-w-xl mx-auto">
            Start buying and selling textbooks today — no registration fee, completely free for students.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/browse">
              <Button size="lg" className="bg-white text-amber-700 hover:bg-white/90 font-bold px-8 rounded-xl hover:scale-105 transition-all shadow-lg">
                Browse Books
              </Button>
            </a>
            <a href="/">
              <Button size="lg" variant="outline" className="border-2 border-white/60 text-white hover:bg-white/10 font-bold px-8 rounded-xl transition-all">
                Start Selling
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
