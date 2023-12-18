import { TestScope } from 'cavy';
import {
  callPlayer,
  callPlayerAndExpectEvent,
  callPlayerAndExpectEvents,
  EventSequence,
  EventType,
  expectEvent,
  expectEvents,
  loadSourceConfig,
  RepeatedEvent,
  startPlayerTest,
} from '../playertesting';
import { Sources } from './helper/Sources';
import {
  AdItem,
  AdSourceType,
  AdvertisingConfig,
} from 'bitmovin-player-react-native';
import { AdTags } from './helper/Ads';
import { Platform } from 'react-native';

export default (spec: TestScope) => {
  function commonAdvertisingTests(
    adItems: AdItem[],
    type: 'VAST' | 'VMAP' | 'progressive'
  ) {
    spec.describe(`scheduling ${type} ads via AdvertisingConfig`, () => {
      spec.it('emits AdScheduled events', async () => {
        const advertisingConfig = {
          schedule: adItems,
        } as AdvertisingConfig;
        await startPlayerTest({ advertisingConfig }, async () => {
          await callPlayerAndExpectEvents((player) => {
            player.load(Sources.artOfMotionHls);
          }, RepeatedEvent(EventType.AdScheduled, adItems.length));
        });
      });
    });
    spec.describe(`scheduling ${type} ads via scheduleAd API`, () => {
      spec.it('emits AdScheduled events', async () => {
        await startPlayerTest({}, async () => {
          await loadSourceConfig(Sources.artOfMotionHls);
          await callPlayerAndExpectEvents((player) => {
            adItems.forEach((adItem) => player.scheduleAd(adItem));
          }, RepeatedEvent(EventType.AdScheduled, adItems.length));
        });
      });
    });
    spec.describe(`playing ${type} ads`, () => {
      spec.it('emits Ad events', async () => {
        const advertisingConfig = {
          schedule: adItems,
        } as AdvertisingConfig;
        await startPlayerTest({ advertisingConfig }, async () => {
          await callPlayer(async (player) => {
            player.load(Sources.artOfMotionHls);
            player.play();
          });
          if (type !== 'progressive') {
            await expectEvent(EventType.AdManifestLoaded, 20);
          }
          await expectEvents(
            EventSequence(
              EventType.AdBreakStarted,
              EventType.AdStarted,
              EventType.AdQuartile,
              EventType.AdQuartile,
              EventType.AdQuartile,
              EventType.AdFinished,
              EventType.AdBreakFinished
            ),
            18
          );
          await callPlayerAndExpectEvent((player) => {
            player.seek(13);
          }, EventType.Seeked);
          if (Platform.OS === 'android' && type === 'VAST') {
            await expectEvent(EventType.AdManifestLoaded, 20);
          }
          await expectEvents(
            EventSequence(
              EventType.AdBreakStarted,
              EventType.AdStarted,
              EventType.AdQuartile,
              EventType.AdQuartile,
              EventType.AdQuartile,
              EventType.AdFinished,
              EventType.AdBreakFinished
            ),
            15
          );
          await callPlayerAndExpectEvent(async (player) => {
            const duration = await player.getDuration();
            player.seek(duration - 5);
          }, EventType.Seeked);
          if (Platform.OS === 'android' && type === 'VAST') {
            await expectEvent(EventType.AdManifestLoaded, 20);
          }
          await expectEvents(
            EventSequence(
              EventType.AdBreakStarted,
              EventType.AdStarted,
              EventType.AdQuartile,
              EventType.AdQuartile,
              EventType.AdQuartile,
              EventType.AdFinished,
              EventType.AdBreakFinished
            ),
            18
          );
        });
      });
    });
  }

  commonAdvertisingTests(
    [{ sources: [{ tag: AdTags.vmapPreMidPost, type: AdSourceType.IMA }] }],
    'VMAP'
  );
  commonAdvertisingTests(
    [
      {
        sources: [{ tag: AdTags.vastSkippable, type: AdSourceType.IMA }],
        position: 'pre',
      },
      {
        sources: [{ tag: AdTags.vast1, type: AdSourceType.IMA }],
        position: '15',
      },
      {
        sources: [{ tag: AdTags.vast2, type: AdSourceType.IMA }],
        position: 'post',
      },
    ],
    'VAST'
  );
  commonAdvertisingTests(
    [
      {
        sources: [{ tag: AdTags.progressive, type: AdSourceType.PROGRESSIVE }],
        position: 'pre',
      },
      {
        sources: [{ tag: AdTags.progressive, type: AdSourceType.PROGRESSIVE }],
        position: '15',
      },
      {
        sources: [{ tag: AdTags.progressive, type: AdSourceType.PROGRESSIVE }],
        position: 'post',
      },
    ],
    'progressive'
  );

  function advertisingErrorTests(adItem: AdItem, label: string) {
    spec.describe(`scheduling erroneous ${label} ad`, () => {
      spec.it('emits AdError events', async () => {
        await startPlayerTest({}, async () => {
          await loadSourceConfig(Sources.artOfMotionHls);
          await callPlayerAndExpectEvent((player) => {
            player.scheduleAd(adItem);
            player.play();
          }, EventType.AdError);
        });
      });
    });
  }

  advertisingErrorTests(
    { sources: [{ tag: AdTags.error, type: AdSourceType.IMA }] },
    'IMA'
  );
  if (Platform.OS !== 'android') {
    // AdError event is not emitted on Android when progressive ad playback fails
    advertisingErrorTests(
      { sources: [{ tag: AdTags.error, type: AdSourceType.PROGRESSIVE }] },
      'progressive'
    );
  }
};
