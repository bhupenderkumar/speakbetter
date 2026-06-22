'use client';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
          The app is ready to use. API keys are configured server-side and are not exposed to the browser.
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <h2 className="font-semibold text-sm text-gray-700 mb-2">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            SpeakBetter uses OpenRouter to power its AI features. All API calls are proxied through our
            server — your API keys stay secure and are never sent to the browser.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <h2 className="font-semibold text-sm text-gray-700 mb-2">Data & Privacy</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your practice history is stored locally in your browser (localStorage). We do not collect
            or store your data on any server.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <h2 className="font-semibold text-sm text-gray-700 mb-2">Deployed on Vercel</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This app is deployed on Vercel&apos;s Edge Network for fast global access.
          </p>
        </div>
      </div>
    </div>
  );
}
