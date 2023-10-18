import { NativeModules } from 'react-native';

const BufferModule = NativeModules.BufferModule;

/**
 * Represents different types of media.
 */
export enum MediaType {
  /**
   * Audio media type.
   * @platform Android
   */
  AUDIO = 0,
  /**
   * Video media type.
   * @platform Android
   */
  VIDEO = 1,
}

/**
 * Represents different types of buffered data.
 */
export enum BufferType {
  /**
   * Represents the buffered data starting at the current playback time.
   */
  FORWARD_DURATION = 0,
  /**
   * Represents the buffered data up until the current playback time.
   */
  BACKWARD_DURATION = 1,
}

/**
 * Holds different information about the buffer levels.
 */
export interface BufferLevel {
  /**
   * The amount of currently buffered data, e.g. audio or video buffer level.
   */
  level?: number;
  /**
   * The target buffer level the player tries to maintain.
   */
  targetLevel?: number;
  /**
   * The media type the buffer data applies to.
   */
  media?: MediaType;
  /**
   * The buffer type the buffer data applies to.
   */
  type?: BufferType;
}

/**
 * Collection of {@link BufferLevel} objects
 */
export interface BufferLevels {
  /**
   * {@link BufferLevel} for {@link MediaType.AUDIO}.
   */
  audio: BufferLevel;
  /**
   * {@link BufferLevel} for {@link MediaType.VIDEO}.
   */
  video: BufferLevel;
}

/**
 * Provides the means to configure buffer settings and to query the current buffer state.
 * Accessible through {@link Player.buffer}.
 */
export class BufferApi {
  /**
   * The native player id that this analytics api is attached to.
   */
  readonly nativeId: string;

  constructor(playerId: string) {
    this.nativeId = playerId;
  }

  /**
   * Returns the {@link BufferLevel} for the chosen {@link BufferType|buffer type} and {@link MediaType|media type} of the active Source.
   * @param type The type of buffer to return the level for.
   * @returns a {@link BufferLevels} that contains {@link BufferLevel} values for audio and video.
   */
  getLevel = async (type: BufferType): Promise<BufferLevels> => {
    return BufferModule.getLevel(this.nativeId, type);
  };

  /**
   * Sets the target buffer level for the chosen buffer {@link BufferType|type} across all {@link MediaType}s.
   *
   * @param type The type of the buffer to set the target level for. On iOS only {@link BufferType.FORWARD_DURATION} is supported.
   * @param value The value to set.
   */
  setTargetLevel = async (type: BufferType, value: number): Promise<void> => {
    return BufferModule.setTargetLevel(this.nativeId, type, value);
  };
}
