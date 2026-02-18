import React from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const testimonials = [
    {
        name: "Cheruiyot Allan",
        role: "Grocery Store Manager",
        image: "SK",
        rating: 5,
        text: "Smart Freshness has transformed how we manage our produce section. We've reduced waste by 35% and our customers always get the freshest products."
    },
    {
        name: "Koley ",
        role: "Supermarket Owner",
        image: "JO",
        rating: 5,
        text: "The real-time alerts are a game-changer. I get notified immediately when any product needs attention, even when I'm away from the store."
    },
    {
        name: "Noraa Ndonga",
        role: "Logistics Coordinator",
        image: "MW",
        rating: 5,
        text: "The dynamic pricing feature alone has increased our revenue by 20%. Products sell faster before they spoil, and customers love the deals."
    }
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-3 mb-4">
                        Trusted by
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"> Industry Leaders</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        See what our clients say about transforming their freshness management.
                    </p>
                </div>

                {/* Testimonials grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                        >
                            {/* Quote icon */}
                            <FaQuoteLeft className="text-3xl text-green-200 mb-4" />

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-yellow-400" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-600 leading-relaxed mb-6">"{testimonial.text}"</p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {testimonial.image}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
