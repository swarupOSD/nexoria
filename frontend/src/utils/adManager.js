const COOLDOWN_MINUTES = 2;
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

/**
 * Triggers a Smartlink ad in a new tab if the cooldown period has passed.
 * Returns true if the ad was triggered (so the caller can block the real action for "Fake Click").
 * 
 * @param {string} smartlinkUrl - The Smartlink / Direct Link URL from SiteSettings
 * @param {boolean} isAdminOrPremium - Should be true if user is Admin or Premium (skips ads)
 * @returns {boolean} - True if ad was shown (fake click triggered), False otherwise
 */
export const triggerSmartlinkWithCooldown = (smartlinkUrl, isAdminOrPremium = false) => {
  if (isAdminOrPremium || !smartlinkUrl) return false;

  const now = Date.now();
  const lastAdShownStr = localStorage.getItem('last_smartlink_shown');
  let lastAdShown = parseInt(lastAdShownStr || '0', 10);

  // If we've never shown it, or the 2-minute cooldown has expired
  if (!lastAdShown || (now - lastAdShown) >= COOLDOWN_MS) {
    // Open Smartlink in new tab (Pop-up/Pop-under style)
    window.open(smartlinkUrl, '_blank');
    
    // Update the last shown timestamp
    localStorage.setItem('last_smartlink_shown', now.toString());
    
    // Return true to indicate we should FAKE the click (abort the actual download/play)
    return true;
  }
  
  return false;
};
