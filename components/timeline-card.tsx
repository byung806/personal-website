export default function TimelineCard() {
  return (
    <div className="h-full bg-white flex flex-col items-center justify-center p-6">
      <div className="text-sm text-gray-500 mb-4 font-medium">
        I'm interested in...
      </div>
      <div className="text-6xl font-bold leading-tight text-center space-y-2">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
          3D
        </div>
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
          AI
        </div>
        <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
          HCI
        </div>
      </div>
    </div>
  );
}
