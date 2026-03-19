import { motion } from 'framer-motion';
import { Mountain, Camera, Users, Award, Heart, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from 'src/components/Card';

const AboutUs = () => {
  const [data, setData] = useState({
    features: [
      {
        iconComponent: Mountain,
        title: "Expert Local Guides",
        description: "Our experienced guides know every hidden gem and secret path"
      },
      {
        iconComponent: Camera,
        title: "Picture Perfect Moments",
        description: "Capture stunning memories with photography-focused tours"
      },
      {
        iconComponent: Users,
        title: "Community Driven",
        description: "Join thousands of travelers who've discovered the magic"
      },
      {
        iconComponent: Award,
        title: "Award Winning",
        description: "Included in top 500 startups of India in Asia largest startup competion Eureka organised by IIT bomaby"
      },
      {
        iconComponent: Heart,
        title: "Passionate Team",
        description: "We love sharing the beauty and culture of our homeland"
      },
      {
        iconComponent: Calendar,
        title: "Year-Round",
        description: "Activities for every season from summer to winter"
      }
    ]
  });

  useEffect(() => {
    fetch('/api/aboutus')
      .then(res => res.json())
      .then(json => {
        if (json && json.features) {
          setData(prev => ({
            ...prev,
            // Allow merging features text while keeping icons safe if API doesn't pass component refs
            features: prev.features.map((f, i) => ({
                ...f, 
                title: json.features[i]?.title || f.title, 
                description: json.features[i]?.description || f.description 
            }))
          }));
        }
      })
      .catch(err => console.log('Using fallback about us data'));
  }, []);

  const { features } = data;


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

      
      <div className="bg-gradient-to-br from-green-50 to-blue-50 pt-10 pb-12 sm:pt-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 mb-16 sm:mb-24 items-center">
            {/* Left side: Images cascade */}
            <motion.div
               initial={{ x: -30, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.6 }}
               viewport={{ once: true }}
               className="relative lg:h-[400px] flex gap-4 hidden sm:flex"
            >
               <img src="/images/Pahalgam1.jpeg" alt="Hiking in Kashmir" className="w-[55%] h-[95%] object-cover rounded-3xl shadow-2xl mt-[5%]" />
               <img src="/images/Dal1.jpeg" alt="Shikara on Dal lake" className="w-[45%] h-[85%] object-cover rounded-3xl shadow-xl absolute right-0 top-0 border-4 border-white transform transition-transform duration-500 hover:scale-105" />
            </motion.div>
            
            {/* Right side: Text Content */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left pt-6 lg:pt-0"
            >
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Redefining the way you experience the world
              </h3>
              <div className="space-y-4 sm:space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  At <span className="font-semibold text-green-700">bagspackgo</span>, we don't just sell tour packages; we build bridges between curious travelers and authentic local cultures. We cut out the middlemen to connect you directly with verified local guides, artisans, and storytellers.
                </p>
                <p>
                  Born out of a deep love for the undiscovered, our mission is to make every journey deeply personal. Whether you're seeking a quiet retreat in a remote mountain valley or a thrilling expedition across glaciers, we guarantee transparent pricing and absolute flexibility.
                </p>
                <p className="font-medium text-gray-800 italic pt-2">
                  — Experience the pulse of the destination, tailored exactly to you.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.iconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-3">{feature.title}</h4>
                <p className="text-gray-500 text-[11px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;