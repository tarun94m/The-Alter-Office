import { HelpCircle } from "lucide-react";

export const NoResults = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-lg p-8 mb-4">
        <HelpCircle className="w-16 h-16 text-gray-400 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        It looks like we can't find any results that match.
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        Try adjusting your search or filter criteria to find what you're looking for.
      </p>
    </div>
  );
};