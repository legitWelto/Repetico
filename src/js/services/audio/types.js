/**
 * @typedef {Object} Section
 * @property {string} name - Name of the section
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 */

/**
 * Interface definition for Audio Services
 * This is primarily for documentation purposes in JavaScript.
 * 
 * @interface IAudioService
 */

/**
 * @function
 * @name IAudioService#load
 * @param {string} url - Blob URL of the audio file
 * @param {Section[]} sections - Array of sections
 * @returns {Promise<void>}
 */

/**
 * @function
 * @name IAudioService#play
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#pause
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#seek
 * @param {number} seconds
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#setSpeed
 * @param {number} rate - Playback rate as decimal (e.g., 1.0, 0.85)
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#setLoop
 * @param {number} start - Start loop time in seconds
 * @param {number} end - End loop time in seconds
 * @param {boolean} autoLoop - Whether to auto-loop
 * @param {number} delay - Delay between loops in milliseconds
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#onProgress
 * @param {function(number): void} callback - Callback receiving currentTime
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#onLoaded
 * @param {function(number): void} callback - Callback receiving duration
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#onPlay
 * @param {function(): void} callback
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#onPause
 * @param {function(): void} callback
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#onSectionChange
 * @param {function(string): void} callback - Callback receiving sectionName
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#onSpeedChange
 * @param {function(number): void} callback - Callback receiving the new speed rate
 * @returns {void}
 */

/**
 * @function
 * @name IAudioService#destroy
 * @returns {void}
 */
