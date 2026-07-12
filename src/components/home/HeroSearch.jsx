import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function HeroSearch() {
  const [practiceArea, setPracticeArea] = useState('all');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (practiceArea && practiceArea !== 'all') params.set('area', practiceArea);
    if (location) params.set('location', location);
    const area = params.get('area');
    navigate(area ? `/?area=${encodeURIComponent(area)}` : '/?browse=1');
  };

  return (
    <section className="bg-gradient-to-b from-secondary to-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
          Find the right lawyer.<br />
          <span className="text-primary">Book in minutes.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Vetted attorneys · Transparent pricing · Flexible payment plans
        </p>

        <div className="bg-white rounded-xl shadow-md border border-border p-3 flex flex-col sm:flex-row gap-3">
          <Select value={practiceArea} onValueChange={setPracticeArea}>
            <SelectTrigger className="sm:w-56 border-0 bg-muted focus:ring-0">
              <SelectValue placeholder="Legal issue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All practice areas</SelectItem>
              <SelectItem value="Family Law">Family Law</SelectItem>
              <SelectItem value="Immigration">Immigration</SelectItem>
              <SelectItem value="Business Formation">Business Formation</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-px sm:h-auto sm:w-px bg-border my-1 sm:my-0" />
          <Input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter your city or state"
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-white px-8 gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}