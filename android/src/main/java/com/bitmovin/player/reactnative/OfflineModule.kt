package com.bitmovin.player.reactnative

import com.bitmovin.player.reactnative.converter.JsonConverter
import com.bitmovin.player.reactnative.extensions.toList
import com.bitmovin.player.reactnative.offline.OfflineDownloadRequest
import com.bitmovin.player.reactnative.offline.OfflineManager
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

private const val OFFLINE_MODULE = "BitmovinOfflineModule"

@ReactModule(name = OFFLINE_MODULE)
class OfflineModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    override fun getName() = OFFLINE_MODULE

    companion object {
        /**
         * In-memory mapping from `nativeId`s to `OfflineManager` instances.
         */
        private val offlineManagers = mutableMapOf<String, OfflineManager>()
    }

    /**
     * Fetches the `OfflineManager` instance associated with `nativeId` from the internal offline managers.
     * @param nativeId `OfflineManager` instance ID.
     * @return The associated `OfflineManager` instance or `null`.
     */
    fun getOfflineManager(nativeId: NativeId?): OfflineManager? {
        if (nativeId == null) {
            return null
        }
        return offlineManagers[nativeId]
    }

    /**
     * Callback when a new NativeEventEmitter is created from the Typescript layer.
     */
    @ReactMethod
    fun addListener(eventName: String?) {
        // NO-OP
    }

    /**
     * Callback when a NativeEventEmitter is removed from the Typescript layer.
     */
    @ReactMethod
    fun removeListeners(count: Int?) {
        // NO-OP
    }

    /**
     * Creates a new `OfflineManager` instance inside the internal offline managers using the provided `config` object.
     * @param config `ReadableMap` object received from JS.  Should contain a sourceConfig and location.
     */
    @ReactMethod
    fun initWithConfig(nativeId: NativeId, config: ReadableMap?) {
        if (!offlineManagers.containsKey(nativeId)) {
            val sourceConfig = JsonConverter.toSourceConfig(config?.getMap("sourceConfig"))
            val location = config?.getString("location") ?: context.cacheDir.path

            if (sourceConfig == null) {
                return
            }
            offlineManagers[nativeId] = OfflineManager(nativeId, context, sourceConfig, location)
        }
    }

    /**
     * Retrieves the current `OfflineSourceConfig`
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun getOfflineSourceConfig(nativeId: NativeId, promise: Promise) {
        promise.resolve(JsonConverter.toJson(getOfflineManager(nativeId)?.contentManager?.offlineSourceConfig))
    }

    /**
     * Starts the `OfflineContentManager`'s asynchronous process of fetching the `OfflineContentOptions`.
     * When the options are loaded a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onOptionsAvailable`.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun getOptions(nativeId: NativeId) {
        getOfflineManager(nativeId)?.getOptions()
    }

    /**
     * Enqueues downloads according to the `OfflineDownloadRequest`.
     * The promise will reject in the event of null or invalid request parameters.
     * The promise will reject an `IllegalOperationException` when selecting an `OfflineOptionEntry` to download that is not compatible with the current state.
     * @param nativeId Target offline manager.
     * @param request `ReadableMap` that contains the `OfflineManager.OfflineOptionType`, id, and `OfflineOptionEntryAction` necessary to set the new action.
     */
    @ReactMethod
    fun process(nativeId: NativeId, request: ReadableMap?, promise: Promise) {
        if (request == null) {
            promise.reject(java.lang.IllegalArgumentException("Request may not be null"))
            return
        }

        try {
            val minimumBitRate = request.getInt("minimumBitrate")
            val audioOptionIds = request.getArray("audioOptionIds")?.toList<String>()
            val textOptionIds = request.getArray("textOptionIds")?.toList<String>()

            if (minimumBitRate < 0 || audioOptionIds.isNullOrEmpty()) {
                promise.reject(java.lang.IllegalArgumentException("Invalid download request"))
                return
            }

            getOfflineManager(nativeId)?.process(OfflineDownloadRequest(
                minimumBitRate, audioOptionIds, textOptionIds
            ))
            promise.resolve(null)
            return
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    /**
     * Resumes all suspended actions.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun resume(nativeId: NativeId) {
        getOfflineManager(nativeId)?.resume()
    }

    /**
     * Suspends all active actions.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun suspend(nativeId: NativeId) {
        getOfflineManager(nativeId)?.suspend()
    }

    /**
     * Deletes everything related to the related content ID.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun deleteAll(nativeId: NativeId) {
        getOfflineManager(nativeId)?.deleteAll()
    }

    /**
     * Downloads the offline license.
     * When finished successfully a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onDrmLicenseUpdated`.
     * Errors are transmitted by a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onError`.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun downloadLicense(nativeId: NativeId) {
        getOfflineManager(nativeId)?.downloadLicense()
    }

    /**
     * Releases the currently held offline license.
     * When finished successfully a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onDrmLicenseUpdated`.
     * Errors are transmitted by a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onError`.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun releaseLicense(nativeId: NativeId) {
        getOfflineManager(nativeId)?.releaseLicense()
    }

    /**
     * Renews the already downloaded DRM license.
     * When finished successfully a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onDrmLicenseUpdated`.
     * Errors are transmitted by a device event will be fired where the event type is `BitmovinOfflineEvent` and the data has an event type of `onError`.
     * @param nativeId Target offline manager.
     */
    @ReactMethod
    fun renewOfflineLicense(nativeId: NativeId) {
        getOfflineManager(nativeId)?.renewOfflineLicense()
    }

    /**
     * Call `.release()` on `nativeId`'s offline manager.
     * IMPORTANT: Call this when the component, in which it was created, is destroyed.
     * The `OfflineManager` should not be used after calling this method.
     * @param nativeId Target player Id.
     */
    @ReactMethod
    fun release(nativeId: NativeId) {
        getOfflineManager(nativeId)?.let {
            it.release()
            offlineManagers.remove(nativeId)
        }
    }

}