import { motion } from 'framer-motion';
import { Mountain, Camera, Users, Award, Heart, Calendar } from 'lucide-react';
import { Card } from 'frontend/src/components/Card';

const AboutUs = () => {
  const stats = [
    { number: "10K+", label: "Happy Travelers" },
    { number: "500+", label: "Verified Guides" },
    { number: "50+", label: "Destinations" }
  ];

  const features = [
    {
      icon: Mountain,
      title: "Expert Local Guides",
      description: "Our experienced guides know every hidden gem and secret path"
    },
    {
      icon: Camera,
      title: "Picture Perfect Moments",
      description: "Capture stunning memories with photography-focused tours"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of travelers who've discovered the magic"
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized for excellence in sustainable tourism"
    },
    {
      icon: Heart,
      title: "Passionate Team",
      description: "We love sharing the beauty and culture of our homeland"
    },
    {
      icon: Calendar,
      title: "Year-Round",
      description: "Activities for every season from summer to winter"
    }
  ];

  return (
    <section className="relative">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 -mt-16">
        <div className="text-center pt-20">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            About <span className="text-green-600">Bagspackgo</span>
          </motion.h2>
          <motion.div 
            className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-12"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              type: "spring",
              stiffness: 50
            }}
          />
        </div>
      </div>

      
      <div className="bg-gradient-to-br from-green-50 to-blue-50 pt-16 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Your Travel Companion</h3>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  BagspackGo connects you directly with verified local guides and travel experts. 
                  We believe in authentic experiences, transparent pricing, and personalized adventures 
                  that create lasting memories.
                </p>
                <p>
                  What started as a small initiative has grown into a comprehensive tourism 
                  platform, offering everything from romantic getaways to adventurous expeditions.
                </p>
                <p>
                  Every experience we curate is infused with the warmth and hospitality that 
                  travelers expect. We don't just show you places – we help you feel the soul of each destination.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((stat, index) => (
                    <div key={index} className="p-4">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;