import { Network, Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Tour", "Templates"],
  Resources: ["Documentation", "Tutorials", "Blog", "Community"],
  Company: ["About", "Careers", "Contact", "Partners"],
  Legal: ["Privacy", "Terms", "Security", "Compliance"],
};

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
                <Network className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-extralight tracking-tight">Kumu</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A powerful visualization platform for mapping systems and understanding relationships.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors duration-300 group">
                <Twitter className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors duration-300 group">
                <Github className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors duration-300 group">
                <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </a>
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-light text-sm mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Kumu. All rights reserved.</p>
          <p className="text-xs">Made with clarity and care for systems thinkers worldwide.</p>
        </div>
      </div>
    </footer>
  );
};
