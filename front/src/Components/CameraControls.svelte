<script lang="ts">
    import { requestedScreenSharingState, screenSharingAvailableStore } from "../Stores/ScreenSharingStore";
    import { isSilentStore, requestedCameraState, requestedMicrophoneState } from "../Stores/MediaStore";
    import { localUserStore } from "../Connexion/LocalUserStore";
    import LL from "../i18n/i18n-svelte";
    import monitorImg from "./images/monitor.svg";
    import monitorCloseImg from "./images/monitor-close.svg";
    import cinemaImg from "./images/cinema.svg";
    import cinemaCloseImg from "./images/cinema-close.svg";
    import microphoneImg from "./images/microphone.svg";
    import microphoneCloseImg from "./images/microphone-close.svg";
    import layoutPresentationImg from "./images/layout-presentation.svg";
    import layoutChatImg from "./images/layout-chat.svg";
    import followImg from "./images/follow.svg";
    import lockImg from "./images/lock.svg";
    import { LayoutMode } from "../WebRtc/LayoutManager";
    import { peerStore } from "../Stores/PeerStore";
    import { onDestroy } from "svelte";
    import { embedScreenLayout } from "../Stores/EmbedScreensStore";
    import { followRoleStore, followStateStore, followUsersStore } from "../Stores/FollowStore";
    import { gameManager } from "../Phaser/Game/GameManager";
    import { currentPlayerGroupLockStateStore } from "../Stores/CurrentPlayerGroupStore";

    const gameScene = gameManager.getCurrentGameScene();

    let camInstructionsVisible = false;

    function screenSharingClick(): void {
        if (isSilent) return;
        if ($requestedScreenSharingState === true) {
            requestedScreenSharingState.disableScreenSharing();
        } else {
            requestedScreenSharingState.enableScreenSharing();
        }
    }

    function cameraClick(): void {
        if (isSilent) return;
        if (localUserStore.getNoVideo()) {
            camInstructionsVisible = true;
            return;
        }
        if ($requestedCameraState === true) {
            requestedCameraState.disableWebcam();
        } else {
            requestedCameraState.enableWebcam();
        }
    }

    function microphoneClick(): void {
        if (isSilent) return;
        if ($requestedMicrophoneState === true) {
            requestedMicrophoneState.disableMicrophone();
        } else {
            requestedMicrophoneState.enableMicrophone();
        }
    }

    function switchLayoutMode() {
        if ($embedScreenLayout === LayoutMode.Presentation) {
            $embedScreenLayout = LayoutMode.VideoChat;
        } else {
            $embedScreenLayout = LayoutMode.Presentation;
        }
    }

    function followClick() {
        switch ($followStateStore) {
            case "off":
                gameScene.connection?.emitFollowRequest();
                followRoleStore.set("leader");
                followStateStore.set("active");
                break;
            case "requesting":
            case "active":
            case "ending":
                gameScene.connection?.emitFollowAbort();
                followUsersStore.stopFollowing();
                break;
        }
    }

    function lockClick() {
        gameScene.connection?.emitLockGroup(!$currentPlayerGroupLockStateStore);
    }

    function unblockCamera() {
        localUserStore.setNoVideo(false);
        requestedCameraState.enableWebcam();
        camInstructionsVisible = false;
    }

    let isSilent: boolean;
    const unsubscribeIsSilent = isSilentStore.subscribe((value) => {
        isSilent = value;
    });
    onDestroy(unsubscribeIsSilent);
</script>

<div class="interact-menu nes-container is-rounded" hidden={!camInstructionsVisible}>
    <section class="interact-menu-question">
        <p>{$LL.camera.disabledInUserSettings()}</p>
    </section>
    <section class="interact-menu-action">
        <button type="button" class="nes-btn is-success" on:click|preventDefault={unblockCamera}>
            {$LL.camera.yes()}
        </button>
        <button type="button" class="nes-btn is-error" on:click|preventDefault={() => (camInstructionsVisible = false)}>
            {$LL.camera.no()}
        </button>
    </section>
</div>

<div class="btn-cam-action">
    <div class="btn-layout" on:click={switchLayoutMode} class:hide={$peerStore.size === 0}>
        {#if $embedScreenLayout === LayoutMode.Presentation}
            <img class="noselect" src={layoutPresentationImg} style="padding: 2px" alt="Switch to mosaic mode" />
        {:else}
            <img class="noselect" src={layoutChatImg} style="padding: 2px" alt="Switch to presentation mode" />
        {/if}
    </div>

    <div
        class="btn-follow"
        class:hide={($peerStore.size === 0 && $followStateStore === "off") || isSilent}
        class:disabled={$followStateStore !== "off"}
        on:click={followClick}
    >
        <img class="noselect" src={followImg} alt="" />
    </div>

    <div
        class="btn-lock"
        class:hide={$peerStore.size === 0 || isSilent}
        class:disabled={$currentPlayerGroupLockStateStore}
        on:click={lockClick}
    >
        <img class="noselect" src={lockImg} alt="" />
    </div>

    <div
        class="btn-monitor"
        on:click={screenSharingClick}
        class:hide={!$screenSharingAvailableStore || isSilent}
        class:enabled={$requestedScreenSharingState}
    >
        {#if $requestedScreenSharingState && !isSilent}
            <img class="noselect" src={monitorImg} alt="Start screen sharing" />
        {:else}
            <img class="noselect" src={monitorCloseImg} alt="Stop screen sharing" />
        {/if}
    </div>

    <div class="btn-video" on:click={cameraClick} class:disabled={!$requestedCameraState || isSilent}>
        {#if $requestedCameraState && !isSilent}
            <img class="noselect" src={cinemaImg} alt="Turn on webcam" />
        {:else}
            <img class="noselect" src={cinemaCloseImg} alt="Turn off webcam" />
        {/if}
    </div>

    <div class="btn-micro" on:click={microphoneClick} class:disabled={!$requestedMicrophoneState || isSilent}>
        {#if $requestedMicrophoneState && !isSilent}
            <img class="noselect" src={microphoneImg} alt="Turn on microphone" />
        {:else}
            <img class="noselect" src={microphoneCloseImg} alt="Turn off microphone" />
        {/if}
    </div>
</div>

<style lang="scss">
    @import "../../style/breakpoints.scss";

    .btn-cam-action {
        pointer-events: all;
        position: absolute;
        display: inline-flex;
        bottom: 10px;
        right: 15px;
        width: 360px;
        height: 40px;
        text-align: center;
        align-content: center;
        justify-content: flex-end;
        z-index: 251;

        &:hover {
            div.hide {
                transform: translateY(60px);
            }
        }
    }
    /*btn animation*/
    .btn-cam-action div {
        cursor: url("../../style/images/cursor_pointer.png"), pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: solid 0px black;
        width: 44px;
        height: 44px;
        background: #666;
        box-shadow: 2px 2px 24px #444;
        border-radius: 48px;
        transform: translateY(15px);
        transition-timing-function: ease-in-out;
        transition: all 0.3s;
        margin: 0 2%;

        &.hide {
            transform: translateY(60px);
        }
    }
    .btn-cam-action div.disabled {
        background: #d75555;
    }
    .btn-cam-action div.enabled {
        background: #73c973;
    }
    .btn-cam-action:hover div {
        transform: translateY(0);
    }
    .btn-cam-action div:hover {
        background: #407cf7;
        box-shadow: 4px 4px 48px #666;
        transition: 120ms;
    }
    .btn-micro {
        pointer-events: auto;
    }
    .btn-video {
        pointer-events: auto;
        transition: all 0.25s;
    }
    .btn-monitor {
        pointer-events: auto;
    }
    .btn-layout {
        pointer-events: auto;
        transition: all 0.15s;
    }
    .btn-cam-action div img {
        height: 22px;
        width: 30px;
        position: relative;
        cursor: url("../../style/images/cursor_pointer.png"), pointer;
    }

    .btn-follow {
        pointer-events: auto;

        img {
            filter: brightness(0) invert(1);
        }
    }

    .btn-lock {
        pointer-events: auto;

        img {
            filter: brightness(0) invert(1);
        }
    }

    @media (hover: none) {
        /**
        * If we cannot hover over elements, let's display camera button in full.
        */
        .btn-cam-action {
            div {
                transform: translateY(0px);
            }
        }
    }

    @include media-breakpoint-up(sm) {
        .btn-cam-action {
            right: 0;
            width: 100%;
            height: 40%;
            max-height: 40px;

            div {
                width: 20%;
                max-height: 44px;
            }
        }
    }

    div.interact-menu {
        pointer-events: auto;
        user-select: none;
        background-color: #333333;
        color: whitesmoke;

        position: absolute;
        left: 20vw;
        width: 60vw;
        top: 60vh;
        margin: auto;

        section.interact-menu-question {
            margin: 4px;
            margin-bottom: 20px;

            p {
                font-size: 1.05em;
                font-weight: bold;
            }
        }

        section.interact-menu-action {
            display: grid;
            grid-gap: 10%;
            grid-template-columns: 45% 45%;
            margin-left: 5%;
            margin-right: 5%;
        }
    }
</style>
