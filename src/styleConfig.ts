/**
 * Contains config values which can be used to alter the visual presentation and behaviour of the player UI.
 */
export interface StyleConfig {
  /**
   * Sets if the UI should be enabled or not. Default value is true.
   * @example
   * ```
   * const player = new Player({
   *   styleConfig: {
   *     isUiEnabled: false,
   *   },
   * });
   * ```
   */
  isUiEnabled: boolean;
  /**
   * iOS/tvOS only.
   *
   * Set which user interface type should be used.
   * Default value is UserInterfaceType.bitmovin on iOS and UserInterfaceType.system on tvOS.
   * This setting only applies if StyleConfig#isUiEnabled is set to true.
   * @example
   * ```
   * const player = new Player({
   *   styleConfig: {
   *     isUiEnabled: false,
   *     userInterfaceType: UserInterfaceType.subtitle,
   *   },
   * });
   * ```
   */
  userInterfaceType?: UserInterfaceType;
  /**
   * Determines how the video content is scaled or stretched within the parent container’s bounds.  Possible values are defined in ScalingMode.
   * Default value is ScalingMode.fit.
   * @example
   * ```
   * const player = new Player({
   *   styleConfig: {
   *     scalingMode: ScalingMode.Zoom,
   *   },
   * });
   * ```
   */
  scalingMode?: ScalingMode;
}

/**
 * Indicates which type of UI should be used.
 */
export enum UserInterfaceType {
  /**
   * Indicates that Bitmovin’s customizable UI should be used.
   */
  bitmovin = 'bitmovin',
  /**
   * Indicates that the system UI should be used.
   */
  system = 'system',
  /**
   * Indicates that only subtitles should be displayed along with the video content
   */
  subtitle = 'subtitle',
}

/**
 * Specifies how the video content is scaled or stretched.
 */
export enum ScalingMode {
  /**
   * Specifies that the player should preserve the video’s aspect ratio and fit the video within the container's bounds.
   */
  Fit = 'Fit',
  /**
   * Specifies that the video should be stretched to fill the container’s bounds. The aspect ratio may not be preserved.
   */
  Stretch = 'Stretch',
  /**
   * Specifies that the player should preserve the video’s aspect ratio and fill the container’s bounds.
   */
  Zoom = 'Zoom',
}
