import { useEffect, useRef } from "react";

interface Node {
  id: string;
  name: string;
  color?: string;
}

interface TimelineEvent {
  source: string | { id: string };
  target: string | { id: string };
  relationship: string;
  year?: number;
  startYear?: number;
  endYear?: number;
}

interface TimelineProps {
  events: TimelineEvent[];
  nodes: Node[];
  onEventClick: (event: TimelineEvent) => void;
  selectedEvent: TimelineEvent | null;
}

export const Timeline = ({ events, nodes, onEventClick, selectedEvent }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const selectedEventRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEvent && selectedEventRef.current && timelineRef.current) {
      const timeline = timelineRef.current;
      const eventElement = selectedEventRef.current;
      const scrollLeft = eventElement.offsetLeft - timeline.clientWidth / 2 + eventElement.clientWidth / 2;
      timeline.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedEvent]);

  // Calculate year range
  const years = events.flatMap(e => {
    if (e.year) return [e.year];
    if (e.startYear && e.endYear) return [e.startYear, e.endYear];
    return [];
  });

  if (years.length === 0) return null;

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const yearRange = maxYear - minYear;
  
  // Add padding (10% on each side)
  const paddedMin = minYear - yearRange * 0.1;
  const paddedMax = maxYear + yearRange * 0.1;
  const totalRange = paddedMax - paddedMin;

  // Generate year markers
  const yearStep = yearRange > 100 ? 20 : yearRange > 50 ? 10 : 5;
  const yearMarkers = [];
  for (let year = Math.ceil(minYear / yearStep) * yearStep; year <= maxYear; year += yearStep) {
    yearMarkers.push(year);
  }

  const getNodeColor = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.color || '#999';
  };

  const getNodeName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.name || nodeId;
  };

  // Group events that are too close together
  const groupedEvents = events.map((event, index) => {
    const eventYear = event.year || event.startYear || 0;
    const position = ((eventYear - paddedMin) / totalRange) * 100;
    
    const sourceId = typeof event.source === 'string' ? event.source : event.source.id;
    const color = getNodeColor(sourceId);
    
    return { event, position, color, index };
  });

  return (
    <div className="py-6 px-6">
      <h3 className="text-sm font-medium mb-4 text-muted-foreground">Historical Timeline</h3>
      <div 
        ref={timelineRef}
        className="relative h-24 overflow-x-auto scrollbar-thin"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="relative h-full" style={{ minWidth: '2000px' }}>
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border" />

          {/* Year markers */}
          {yearMarkers.map(year => {
            const position = ((year - paddedMin) / totalRange) * 100;
            return (
              <div
                key={year}
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                style={{ left: `${position}%` }}
              >
                <div className="w-px h-3 bg-border mb-1" />
                <span className="text-xs text-muted-foreground">{year}</span>
              </div>
            );
          })}

          {/* Events */}
          {groupedEvents.map(({ event, position, color, index }) => {
            const isSelected = selectedEvent === event;
            const sourceId = typeof event.source === 'string' ? event.source : event.source.id;
            const targetId = typeof event.target === 'string' ? event.target : event.target.id;
            const sourceName = getNodeName(sourceId);
            const targetName = getNodeName(targetId);

            return (
              <div
                key={index}
                ref={isSelected ? selectedEventRef : null}
                className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${position}%` }}
                onClick={() => onEventClick(event)}
              >
                {/* Event dot */}
                <div 
                  className={`w-4 h-4 rounded-full border-3 border-white transition-all ${
                    isSelected ? 'scale-150' : 'group-hover:scale-125'
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow: isSelected 
                      ? `0 0 20px ${color}, 0 0 40px ${color}` 
                      : `0 0 10px ${color}`
                  }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-popover text-popover-foreground border border-border rounded-lg p-3 shadow-lg whitespace-nowrap min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-sm">
                        {event.year || `${event.startYear}-${event.endYear}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {sourceName} ↔ {targetName}
                    </p>
                    <p className="text-xs">{event.relationship}</p>
                    <p className="text-xs text-primary mt-1">Click to highlight connection</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
