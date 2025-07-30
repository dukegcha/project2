'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CustomCalendar from '@/components/ui/custom-calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { authAPI, availabilityAPI, reservationsAPI, formatDateForAPI, formatDateTimeForAPI } from '@/lib/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

interface RestaurantInfo {
  name: string;
  description: string;
  rating: number;
  totalReviews: number;
  cuisine: string[];
  address: string;
  phone: string;
  hours: string;
  priceRange: string;
  image: string;
}

const RestaurantComponent: React.FC = () => {
  const [date, setDate] = useState<Date>();
  const [partySize, setPartySize] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showTimeSelection, setShowTimeSelection] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    setIsAuthenticated(authAPI.isAuthenticated());
  }, []);

  // Fetch available time slots when date and party size are selected
  useEffect(() => {
    if (date && partySize) {
      fetchAvailableSlots();
    }
  }, [date, partySize]);

  const fetchAvailableSlots = async () => {
    if (!date || !partySize) return;
    
    setLoading(true);
    setError("");
    
    try {
      const dateStr = formatDateForAPI(date);
      const slots = await availabilityAPI.getAvailableSlots(dateStr, parseInt(partySize));
      
      // Extract available time slots
      const available = slots
        .filter(slot => slot.available)
        .map(slot => slot.time);
      
      setAvailableSlots(available);
      setShowTimeSelection(available.length > 0);
      
      if (available.length === 0) {
        setError("No available time slots for the selected date and party size.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch availability");
      setAvailableSlots([]);
      setShowTimeSelection(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!date || !partySize || !selectedTime) return;
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const dateTimeStr = formatDateTimeForAPI(date, selectedTime);
      
      await reservationsAPI.createReservation({
        party_size: parseInt(partySize),
        reservation_time: dateTimeStr,
      });

      // Reset form and show success
      setDate(undefined);
      setPartySize("");
      setSelectedTime("");
      setShowTimeSelection(false);
      setAvailableSlots([]);
      
      alert("Reservation confirmed! You will receive a confirmation email shortly.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // Automatically proceed with reservation if form is complete
    if (date && partySize && selectedTime) {
      handleReservation();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop"
          alt="Hanakin Sushi & Izakaya"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-6xl font-bold mb-6">Welcome to Hanakin Sushi & Izakaya</h1>
            <p className="text-2xl mb-12 max-w-3xl mx-auto">
              Experience authentic Japanese cuisine in a warm, welcoming atmosphere. 
              Discover our fresh sushi, traditional izakaya dishes, and exceptional sake selection.
            </p>

            {/* Reservation Form */}
            <Card className="bg-white/95 backdrop-blur-sm max-w-lg mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Make a Reservation</h3>
                
                <div className="space-y-4">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CustomCalendar
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Party Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Party</label>
                    <Select value={partySize} onValueChange={setPartySize}>
                      <SelectTrigger className="w-full">
                        <Users className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select party size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3">3 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="5">5 people</SelectItem>
                        <SelectItem value="6">6 people</SelectItem>
                        <SelectItem value="7">7 people</SelectItem>
                        <SelectItem value="8">8+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Selection */}
                  {showTimeSelection && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose available time" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Make Reservation Button */}
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                    disabled={loading || !date || !partySize || (showTimeSelection && !selectedTime)}
                    onClick={handleReservation}
                  >
                    {loading 
                      ? 'Processing...' 
                      : showTimeSelection 
                      ? 'Make Reservation' 
                      : 'Check Availability'
                    }
                  </Button>

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-600 text-sm text-center">
                      {error}
                    </div>
                  )}
                </div>

                {/* Sign In / Sign Up Buttons */}
                {!isAuthenticated && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowLoginModal(true)}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="flex-1 bg-gray-900 hover:bg-gray-800"
                        onClick={() => setShowRegisterModal(true)}
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}

                {/* Authenticated User Actions */}
                {isAuthenticated && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      You are signed in ✓
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        authAPI.logout();
                        setIsAuthenticated(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleAuthSuccess}
        switchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleAuthSuccess}
        switchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default RestaurantComponent;