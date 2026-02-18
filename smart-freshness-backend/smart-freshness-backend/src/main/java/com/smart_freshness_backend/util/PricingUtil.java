package com.smart_freshness_backend.util;

import org.springframework.stereotype.Component;

/**
 * Utility class for dynamic pricing calculations based on freshness metrics.
 * Implements a tiered pricing strategy that automatically adjusts prices
 * based on produce freshness to minimize waste and maximize revenue.
 */
@Component
public class PricingUtil {

    // Freshness thresholds
    private static final int FRESH_THRESHOLD = 80;
    private static final int GOOD_THRESHOLD = 60;
    private static final int MODERATE_THRESHOLD = 40;
    private static final int LOW_THRESHOLD = 20;

    // Discount rates
    private static final double NO_DISCOUNT = 1.0;
    private static final double SMALL_DISCOUNT = 0.90; // 10% off
    private static final double MEDIUM_DISCOUNT = 0.75; // 25% off
    private static final double LARGE_DISCOUNT = 0.50; // 50% off
    private static final double CRITICAL_DISCOUNT = 0.25; // 75% off

    // VOC thresholds for freshness calculation (ppm)
    private static final double VOC_LOW = 50;
    private static final double VOC_MEDIUM = 150;
    private static final double VOC_HIGH = 300;
    private static final double VOC_MAX = 500;

    // Temperature thresholds for produce (Celsius)
    private static final double TEMP_OPTIMAL_MIN = 4;
    private static final double TEMP_OPTIMAL_MAX = 10;
    private static final double TEMP_ACCEPTABLE_MAX = 15;
    private static final double TEMP_DANGER_MAX = 30;

    // Humidity thresholds (percentage)
    private static final double HUMIDITY_OPTIMAL_MIN = 85;
    private static final double HUMIDITY_OPTIMAL_MAX = 95;
    private static final double HUMIDITY_ACCEPTABLE_MIN = 60;

    /**
     * Calculate dynamic price based on freshness score.
     * Uses a tiered discount system to encourage quick sale of less fresh produce.
     * 
     * @param basePrice      The original product price
     * @param freshnessScore Score from 0-100
     * @return Adjusted price rounded to 2 decimal places
     */
    public double calculateDynamicPrice(double basePrice, int freshnessScore) {
        double multiplier;

        if (freshnessScore >= FRESH_THRESHOLD) {
            // Fresh: Full price
            multiplier = NO_DISCOUNT;
        } else if (freshnessScore >= GOOD_THRESHOLD) {
            // Good: 10% discount
            multiplier = SMALL_DISCOUNT;
        } else if (freshnessScore >= MODERATE_THRESHOLD) {
            // Moderate: 25% discount
            multiplier = MEDIUM_DISCOUNT;
        } else if (freshnessScore >= LOW_THRESHOLD) {
            // Low: 50% discount
            multiplier = LARGE_DISCOUNT;
        } else {
            // Critical: 75% discount (quick sale to avoid complete waste)
            multiplier = CRITICAL_DISCOUNT;
        }

        return Math.round(basePrice * multiplier * 100.0) / 100.0;
    }

    /**
     * Calculate freshness score from sensor data using weighted algorithm.
     * VOC is the primary indicator (60%), with temperature (25%) and humidity (15%)
     * as secondary factors.
     * 
     * @param voc         Volatile Organic Compounds level (ppm) - higher = less
     *                    fresh
     * @param temperature Current temperature (Celsius)
     * @param humidity    Humidity percentage
     * @return Freshness score 0-100
     */
    public int calculateFreshnessScore(double voc, double temperature, double humidity) {
        int vocScore = calculateVocScore(voc);
        int tempScore = calculateTemperatureScore(temperature);
        int humidityScore = calculateHumidityScore(humidity);

        // Weighted average: VOC is most important indicator
        double weightedScore = (vocScore * 0.60) + (tempScore * 0.25) + (humidityScore * 0.15);

        return (int) Math.round(Math.max(0, Math.min(100, weightedScore)));
    }

    /**
     * Calculate VOC-based freshness score.
     * Lower VOC = fresher produce.
     */
    private int calculateVocScore(double voc) {
        if (voc <= VOC_LOW) {
            return 100;
        } else if (voc <= VOC_MEDIUM) {
            // Linear interpolation from 100 to 70
            return (int) (100 - ((voc - VOC_LOW) / (VOC_MEDIUM - VOC_LOW)) * 30);
        } else if (voc <= VOC_HIGH) {
            // Linear interpolation from 70 to 40
            return (int) (70 - ((voc - VOC_MEDIUM) / (VOC_HIGH - VOC_MEDIUM)) * 30);
        } else if (voc <= VOC_MAX) {
            // Linear interpolation from 40 to 10
            return (int) (40 - ((voc - VOC_HIGH) / (VOC_MAX - VOC_HIGH)) * 30);
        } else {
            return 0;
        }
    }

    /**
     * Calculate temperature-based freshness score.
     * Optimal range is 4-10°C for most produce.
     */
    private int calculateTemperatureScore(double temperature) {
        if (temperature >= TEMP_OPTIMAL_MIN && temperature <= TEMP_OPTIMAL_MAX) {
            return 100;
        } else if (temperature < TEMP_OPTIMAL_MIN && temperature >= 0) {
            // Slightly cold but acceptable
            return 85;
        } else if (temperature < 0) {
            // Freezing - bad for most produce
            return 30;
        } else if (temperature <= TEMP_ACCEPTABLE_MAX) {
            // Warm but still acceptable
            return (int) (100 - ((temperature - TEMP_OPTIMAL_MAX) /
                    (TEMP_ACCEPTABLE_MAX - TEMP_OPTIMAL_MAX)) * 30);
        } else if (temperature <= TEMP_DANGER_MAX) {
            // Danger zone
            return (int) (70 - ((temperature - TEMP_ACCEPTABLE_MAX) /
                    (TEMP_DANGER_MAX - TEMP_ACCEPTABLE_MAX)) * 50);
        } else {
            return 10;
        }
    }

    /**
     * Calculate humidity-based freshness score.
     * Optimal range is 85-95% for most produce.
     */
    private int calculateHumidityScore(double humidity) {
        if (humidity >= HUMIDITY_OPTIMAL_MIN && humidity <= HUMIDITY_OPTIMAL_MAX) {
            return 100;
        } else if (humidity > HUMIDITY_OPTIMAL_MAX && humidity <= 98) {
            // Slightly too humid
            return 85;
        } else if (humidity > 98) {
            // Too humid - promotes mold
            return 50;
        } else if (humidity >= HUMIDITY_ACCEPTABLE_MIN) {
            // Acceptable range
            return (int) (60 + ((humidity - HUMIDITY_ACCEPTABLE_MIN) /
                    (HUMIDITY_OPTIMAL_MIN - HUMIDITY_ACCEPTABLE_MIN)) * 40);
        } else if (humidity >= 40) {
            // Low humidity
            return (int) (30 + ((humidity - 40) / 20) * 30);
        } else {
            return 20;
        }
    }

    /**
     * Get the freshness status label based on score.
     */
    public String getFreshnessStatus(int freshnessScore) {
        if (freshnessScore >= FRESH_THRESHOLD) {
            return "Fresh";
        } else if (freshnessScore >= GOOD_THRESHOLD) {
            return "Good";
        } else if (freshnessScore >= MODERATE_THRESHOLD) {
            return "Moderate";
        } else if (freshnessScore >= LOW_THRESHOLD) {
            return "Low";
        } else {
            return "Critical";
        }
    }

    /**
     * Get the discount percentage.
     */
    public int getDiscountPercentage(int freshnessScore) {
        if (freshnessScore >= FRESH_THRESHOLD) {
            return 0;
        } else if (freshnessScore >= GOOD_THRESHOLD) {
            return 10;
        } else if (freshnessScore >= MODERATE_THRESHOLD) {
            return 25;
        } else if (freshnessScore >= LOW_THRESHOLD) {
            return 50;
        } else {
            return 75;
        }
    }
}
