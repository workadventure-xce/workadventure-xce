<script lang="ts">
    import { localUserStore } from "../../Connexion/LocalUserStore";
    import { isSilentStore, videoConstraintStore } from "../../Stores/MediaStore";
    import { audioManagerFileStore, audioManagerVisibilityStore } from "../../Stores/AudioManagerStore";
    import { requestedCameraState } from "../../Stores/MediaStore";
    import { HtmlUtils } from "../../WebRtc/HtmlUtils";
    import { menuVisiblilityStore } from "../../Stores/MenuStore";
    import LL, { locale } from "../../i18n/i18n-svelte";
    import type { Locales } from "../../i18n/i18n-types";
    import { displayableLocales, setCurrentLocale } from "../../i18n/locales";
    import { isMediaBreakpointUp } from "../../Utils/BreakpointsUtils";
    import { audioManagerVolumeStore } from "../../Stores/AudioManagerStore";
    import { gameManager } from "../../Phaser/Game/GameManager";

    let fullscreen: boolean = localUserStore.getFullscreen();
    let notification: boolean = localUserStore.getNotification() === "granted";
    let blockAudio: boolean = localUserStore.getBlockAudio();
    let forceCowebsiteTrigger: boolean = localUserStore.getForceCowebsiteTrigger();
    let ignoreFollowRequests: boolean = localUserStore.getIgnoreFollowRequests();
    let decreaseAudioPlayerVolumeWhileTalking: boolean = localUserStore.getDecreaseAudioPlayerVolumeWhileTalking();
    let alwaysSilent: boolean = localUserStore.getAlwaysSilent();
    let noVideo: boolean = localUserStore.getNoVideo();
    let disableAnimations: boolean = localUserStore.getDisableAnimations();
    let valueGame: number = localUserStore.getGameQualityValue();
    let valueVideo: number = localUserStore.getVideoQualityValue();
    let valueLocale: string = $locale;
    let valueCameraPrivacySettings = localUserStore.getCameraPrivacySettings();
    let valueMicrophonePrivacySettings = localUserStore.getMicrophonePrivacySettings();
    let blockExternalContent: boolean = localUserStore.getBlockExternalContent();

    let previewValueGame = valueGame;
    let previewValueVideo = valueVideo;
    let previewValueLocale = valueLocale;
    let previewCameraPrivacySettings = valueCameraPrivacySettings;
    let previewMicrophonePrivacySettings = valueMicrophonePrivacySettings;
    let previousBlockExternalContent = blockExternalContent;

    function saveSetting() {
        let change = false;

        if (valueLocale !== previewValueLocale) {
            previewValueLocale = valueLocale;
            setCurrentLocale(valueLocale as Locales);
        }

        if (valueVideo !== previewValueVideo) {
            previewValueVideo = valueVideo;
            videoConstraintStore.setFrameRate(valueVideo);
        }

        if (valueGame !== previewValueGame) {
            previewValueGame = valueGame;
            localUserStore.setGameQualityValue(valueGame);
            change = true;
        }

        if (valueCameraPrivacySettings !== previewCameraPrivacySettings) {
            previewCameraPrivacySettings = valueCameraPrivacySettings;
            localUserStore.setCameraPrivacySettings(valueCameraPrivacySettings);
        }

        if (valueMicrophonePrivacySettings !== previewMicrophonePrivacySettings) {
            previewMicrophonePrivacySettings = valueMicrophonePrivacySettings;
            localUserStore.setMicrophonePrivacySettings(valueMicrophonePrivacySettings);
        }

        audioManagerVolumeStore.setDecreaseWhileTalking(decreaseAudioPlayerVolumeWhileTalking);

        if (blockExternalContent !== previousBlockExternalContent) {
            previousBlockExternalContent = blockExternalContent;
            localUserStore.setBlockExternalContent(blockExternalContent);
            change = true;
        }

        if (change) {
            window.location.reload();
        }

        closeMenu();
    }

    function changeFullscreen() {
        const body = HtmlUtils.querySelectorOrFail("body");
        if (body) {
            if (document.fullscreenElement !== null && !fullscreen) {
                document.exitFullscreen().catch((e) => console.error(e));
            } else {
                body.requestFullscreen().catch((e) => console.error(e));
            }
            localUserStore.setFullscreen(fullscreen);
        }
    }

    function changeNotification() {
        if (Notification.permission === "granted") {
            localUserStore.setNotification(notification ? "granted" : "denied");
        } else {
            Notification.requestPermission()
                .then((response) => {
                    if (response === "granted") {
                        localUserStore.setNotification(notification ? "granted" : "denied");
                    } else {
                        localUserStore.setNotification("denied");
                        notification = false;
                    }
                })
                .catch((e) => console.error(e));
        }
    }

    function changeBlockAudio() {
        if (blockAudio) {
            audioManagerFileStore.unloadAudio();
            audioManagerVisibilityStore.set(false);
        }
        localUserStore.setBlockAudio(blockAudio);
    }

    function changeForceCowebsiteTrigger() {
        localUserStore.setForceCowebsiteTrigger(forceCowebsiteTrigger);
    }

    function changeIgnoreFollowRequests() {
        localUserStore.setIgnoreFollowRequests(ignoreFollowRequests);
    }

    function changeDecreaseAudioPlayerVolumeWhileTalking() {
        localUserStore.setDecreaseAudioPlayerVolumeWhileTalking(decreaseAudioPlayerVolumeWhileTalking);
    }

    function changeAlwaysSilent() {
        localUserStore.setAlwaysSilent(alwaysSilent);
        const scene = gameManager.getCurrentGameScene();
        const silentZone = scene.isSilentZone();
        const silent = alwaysSilent || silentZone;
        scene.connection?.setSilent(silent);
        // We need to make sure this flag toggles at least once to update UI
        isSilentStore.set(!silent);
        isSilentStore.set(silent);
    }

    function changeNoVideo() {
        localUserStore.setNoVideo(noVideo);
        if (noVideo) {
            requestedCameraState.disableWebcam();
        }
    }

    function changeDisableAnimations() {
        localUserStore.setDisableAnimations(disableAnimations);
        if (disableAnimations) {
            gameManager.getCurrentGameScene().animatedTiles.pause();
        } else {
            gameManager.getCurrentGameScene().animatedTiles.resume();
        }
    }

    function closeMenu() {
        menuVisiblilityStore.set(false);
    }

    const isMobile = isMediaBreakpointUp("md");
</script>

<div class="settings-main" on:submit|preventDefault={saveSetting}>
    <section>
        <h3>{$LL.menu.settings.gameQuality.title()}</h3>
        <div class="nes-select is-dark">
            <select bind:value={valueGame}>
                <option value={120}
                    >{isMobile
                        ? $LL.menu.settings.gameQuality.short.high()
                        : $LL.menu.settings.gameQuality.long.high()}</option
                >
                <option value={60}
                    >{isMobile
                        ? $LL.menu.settings.gameQuality.short.medium()
                        : $LL.menu.settings.gameQuality.long.medium()}</option
                >
                <option value={40}
                    >{isMobile
                        ? $LL.menu.settings.gameQuality.short.small()
                        : $LL.menu.settings.gameQuality.long.small()}</option
                >
                <option value={20}
                    >{isMobile
                        ? $LL.menu.settings.gameQuality.short.minimum()
                        : $LL.menu.settings.gameQuality.long.minimum()}</option
                >
            </select>
        </div>
    </section>
    <section>
        <h3>{$LL.menu.settings.videoQuality.title()}</h3>
        <div class="nes-select is-dark">
            <select bind:value={valueVideo}>
                <option value={30}
                    >{isMobile
                        ? $LL.menu.settings.videoQuality.short.high()
                        : $LL.menu.settings.videoQuality.long.high()}</option
                >
                <option value={20}
                    >{isMobile
                        ? $LL.menu.settings.videoQuality.short.medium()
                        : $LL.menu.settings.videoQuality.long.medium()}</option
                >
                <option value={10}
                    >{isMobile
                        ? $LL.menu.settings.videoQuality.short.small()
                        : $LL.menu.settings.videoQuality.long.small()}</option
                >
                <option value={5}
                    >{isMobile
                        ? $LL.menu.settings.videoQuality.short.minimum()
                        : $LL.menu.settings.videoQuality.long.minimum()}</option
                >
            </select>
        </div>
    </section>
    <section>
        <h3>{$LL.menu.settings.language.title()}</h3>
        <div class="nes-select is-dark">
            <select class="languages-switcher" bind:value={valueLocale}>
                {#each displayableLocales as locale (locale.id)}
                    <option value={locale.id}>{`${locale.language} (${locale.country})`}</option>
                {/each}
            </select>
        </div>
    </section>
    <section>
        <h3>{$LL.menu.settings.privacySettings.title()}</h3>
        <p>{$LL.menu.settings.privacySettings.explanation()}</p>
        <label>
            <input type="checkbox" class="nes-checkbox is-dark" bind:checked={valueCameraPrivacySettings} />
            <span>{$LL.menu.settings.privacySettings.cameraToggle()}</span>
        </label>
        <label>
            <input type="checkbox" class="nes-checkbox is-dark" bind:checked={valueMicrophonePrivacySettings} />
            <span>{$LL.menu.settings.privacySettings.microphoneToggle()}</span>
        </label>
    </section>
    <section>
        <label>
            <input type="checkbox" class="nes-checkbox is-dark" bind:checked={blockExternalContent} />
            <span>{$LL.menu.settings.blockExternalContent()}</span>
        </label>
    </section>
    <section class="settings-section-save">
        <p>{$LL.menu.settings.save.warning()}</p>
        <button type="button" class="nes-btn is-primary" on:click|preventDefault={saveSetting}
            >{$LL.menu.settings.save.button()}</button
        >
    </section>
    <section class="settings-section-noSaveOption">
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={fullscreen}
                on:change={changeFullscreen}
            />
            <span>{$LL.menu.settings.fullscreen()}</span>
        </label>
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={notification}
                on:change={changeNotification}
            />
            <span>{$LL.menu.settings.notifications()}</span>
        </label>
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={blockAudio}
                on:change={changeBlockAudio}
            />
            <span>{$LL.menu.settings.blockAudio()}</span>
        </label>
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={forceCowebsiteTrigger}
                on:change={changeForceCowebsiteTrigger}
            />
            <span>{$LL.menu.settings.cowebsiteTrigger()}</span>
        </label>
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={ignoreFollowRequests}
                on:change={changeIgnoreFollowRequests}
            />
            <span>{$LL.menu.settings.ignoreFollowRequest()}</span>
            <label>
                <input
                    type="checkbox"
                    class="nes-checkbox is-dark"
                    bind:checked={decreaseAudioPlayerVolumeWhileTalking}
                    on:change={changeDecreaseAudioPlayerVolumeWhileTalking}
                />
                <span>{$LL.audio.manager.reduce()}</span>
            </label>
        </label>
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={alwaysSilent}
                on:change={changeAlwaysSilent}
            />
            <span>{$LL.menu.settings.silentMode()}</span>
        </label>
        <label>
            <input type="checkbox" class="nes-checkbox is-dark" bind:checked={noVideo} on:change={changeNoVideo} />
            <span>{$LL.menu.settings.noVideo()}</span>
        </label>
        <label>
            <input
                type="checkbox"
                class="nes-checkbox is-dark"
                bind:checked={disableAnimations}
                on:change={changeDisableAnimations}
            />
            <span>{$LL.menu.settings.disableAnimations()}</span>
        </label>
    </section>
</div>

<style lang="scss">
    @import "../../../style/breakpoints.scss";

    div.settings-main {
        height: calc(100% - 40px);
        overflow-y: auto;

        section {
            width: 100%;
            padding: 20px 20px 0;
            margin-bottom: 20px;
            text-align: center;

            div.nes-select select:focus {
                outline: none;
            }
        }

        section.settings-section-save {
            text-align: center;

            p {
                margin: 16px 0;
            }
        }

        section.settings-section-noSaveOption {
            display: flex;
            align-items: center;
            flex-wrap: wrap;

            label {
                flex: 1 1 auto;
                text-align: center;
                margin: 0 0 15px;
            }
        }

        .languages-switcher option {
            text-transform: capitalize;
        }
    }

    @include media-breakpoint-up(md) {
        div.settings-main {
            section {
                padding: 0;
            }
        }
    }
</style>
