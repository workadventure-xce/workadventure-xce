<script lang="ts">
    import { contactPageStore } from "../../Stores/MenuStore";
</script>

<div>
    <section>
        <iframe
            title="contact"
            src={$contactPageStore}
            allow="clipboard-read; clipboard-write self {$contactPageStore}"
            allowfullscreen
            class="tw-border-0 tw-w-full tw-h-screen"
        />
    </section>
</div>
