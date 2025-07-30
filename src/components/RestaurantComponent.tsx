'use client';

import React, { useState } from 'react';
import { Calendar, Users, CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CustomCalendar from '@/components/ui/custom-calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

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

                  {/* Check Availability Button */}
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                    disabled={!date || !partySize}
                  >
                    Check Availability
                  </Button>
                </div>

                {/* Sign In / Sign Up Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1">
                      Sign In
                    </Button>
                    <Button className="flex-1 bg-gray-900 hover:bg-gray-800">
                      Sign Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantComponent;