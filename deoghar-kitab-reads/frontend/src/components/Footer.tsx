import { motion } from "framer-motion";
import {
  Facebook, Twitter, Instagram, Youtube,
  ArrowRight, Mail, Phone, MapPin, Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { label: "Browse Books",  href: "/browse" },
    { label: "Sell a Book",   href: "#sell" },
    { label: "How It Works",  href: "#why" },
    { label: "Testimonials",  href: "#testimonials" },
    { label: "About Us",      href: "#" },
  ];

  const supportLinks = [
    { label: "FAQ",           href: "#" },
    { label: "Shipping Info", href: "#" },
    { label: "Return Policy", href: "#" },
    { label: "Contact Us",    href: "#" },
    { label: "Report Issue",  href: "#" },
  ];

  const socials = [
    { icon: Facebook,  href: "https://www.facebook.com",                                     label: "Facebook" },
    { icon: Twitter,   href: "https://www.twitter.com",                                      label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/deogharkitab?igsh=dDBqMmNpYmNscXlz", label: "Instagram" },
    { icon: Youtube,   href: "#",                                                             label: "YouTube" },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/favicon.ico" alt="Deoghar Kitab" className="w-7 h-7 object-contain" loading="eager" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Deoghar Kitab
              </span>
            </div>
            <p className="text-background/65 text-sm leading-relaxed mb-6">
              {t.footer.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2.5 text-background/65 text-sm">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                Deoghar, Jharkhand, India
              </div>
              <div className="flex items-center gap-2.5 text-background/65 text-sm">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                hello@deogharkitab.in
              </div>
              <div className="flex items-center gap-2.5 text-background/65 text-sm">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                +91 99999 XXXXX
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-9 h-9 rounded-xl bg-background/10 flex items-center justify-center hover:bg-amber-500 transition-all duration-200 hover:scale-110"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-5 text-background">{t.footer.quickLinks}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/65 hover:text-amber-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-5 text-background">{t.footer.support}</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/65 hover:text-amber-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-5 text-background">{t.footer.stayUpdated}</h3>
            <p className="text-background/65 text-sm mb-4 leading-relaxed">
              {t.footer.newsletterText}
            </p>
            <div className="flex gap-2 mb-6">
              <Input
                type="email"
                placeholder={t.footer.emailPlaceholder}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/40 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm h-10"
              />
              <Button size="icon" className="bg-amber-500 hover:bg-amber-400 rounded-xl flex-shrink-0 h-10 w-10">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="space-y-2">
              {["100% Student Friendly", "No Listing Fee", "Verified Sellers Only"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-background/65 text-xs">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  {badge}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-background/50 text-sm flex items-center gap-1.5">
            {t.footer.copyright} · Made with <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> for students
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/50 hover:text-amber-400 transition-colors">
              {t.footer.privacyPolicy}
            </a>
            <a href="#" className="text-background/50 hover:text-amber-400 transition-colors">
              {t.footer.termsOfService}
            </a>
            <a href="#" className="text-background/50 hover:text-amber-400 transition-colors">
              Sitemap
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
