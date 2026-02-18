import React, { useState } from "react";
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const contactMethods = [
    {
        icon: FaPhone,
        title: "Call Us",
        description: "Speak directly with our team",
        action: "tel:+254742470479",
        buttonText: "Call Now",
        color: "from-blue-500 to-blue-600",
        details: ["+254 742 470 479", "+254 725 927 986", "+254 729 820 712"]
    },
    {
        icon: FaWhatsapp,
        title: "WhatsApp",
        description: "Chat with us on WhatsApp",
        action: "https://wa.me/254742470479?text=Hello%2C%20I'm%20interested%20in%20the%20Smart%20Freshness%20System",
        buttonText: "Chat Now",
        color: "from-green-500 to-green-600",
        details: ["Quick responses", "Share photos & videos", "Available 24/7"]
    },
    {
        icon: FaEnvelope,
        title: "Email Us",
        description: "Send us a detailed message",
        action: "mailto:allancheruiyot69@gmail.com?subject=Smart%20Freshness%20Inquiry",
        buttonText: "Send Email",
        color: "from-purple-500 to-purple-600",
        details: ["allancheruiyot69@gmail.com"]
    }
];

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        interest: "demo"
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, we'll just show a success message
        // In production, this would send to a backend or email service
        setSubmitted(true);
        toast.success("Thank you! We'll get back to you soon.");

        // Reset after 3 seconds
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", phone: "", message: "", interest: "demo" });
        }, 3000);
    };

    return (
        <section id="contact" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Contact Us</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-3 mb-4">
                        Get In Touch
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"> With Us</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Interested in transforming your freshness management? Reach out through any channel below.
                    </p>
                </div>

                {/* Contact Methods */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {contactMethods.map((method, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 p-8 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-green-100 text-center"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                <method.icon className="text-2xl text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{method.title}</h3>
                            <p className="text-gray-500 mb-4">{method.description}</p>

                            {/* Details */}
                            <div className="text-sm text-gray-600 mb-6 space-y-1">
                                {method.details.map((detail, i) => (
                                    <p key={i}>{detail}</p>
                                ))}
                            </div>

                            <a
                                href={method.action}
                                target={method.title === "WhatsApp" ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className={`inline-block px-6 py-3 bg-gradient-to-r ${method.color} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg`}
                            >
                                {method.buttonText}
                            </a>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Form */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>

                        {submitted ? (
                            <div className="text-center py-12">
                                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h4>
                                <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                            placeholder="Allan Cheruiyot"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                            placeholder="+254 7XX XXX XXX"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                        placeholder="allancheruiyot69@gmail.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">I'm Interested In</label>
                                    <select
                                        name="interest"
                                        value={formData.interest}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                    >
                                        <option value="demo">Product Demo</option>
                                        <option value="pricing">Pricing Information</option>
                                        <option value="partnership">Partnership Opportunity</option>
                                        <option value="support">Technical Support</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                                        placeholder="Tell us about your needs..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FaPaperPlane /> Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Us?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Fast Response Time</p>
                                        <p className="text-gray-500 text-sm">We respond to all inquiries within 24 hours</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Free Consultation</p>
                                        <p className="text-gray-500 text-sm">No obligation demo and needs assessment</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Local Support</p>
                                        <p className="text-gray-500 text-sm">Based in Eldoret, Kenya with nationwide coverage</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Custom Solutions</p>
                                        <p className="text-gray-500 text-sm">Tailored packages for your specific needs</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gray-100 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <FaMapMarkerAlt className="text-green-500 text-xl" />
                                <h4 className="font-bold text-gray-800">Our Location</h4>
                            </div>
                            <p className="text-gray-600">
                                Eldoret, Kenya<br />
                                Available for on-site consultations in<br />
                                Uasin Gishu and surrounding counties
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
