package com.linkachu.msarepo

import com.lagradost.cloudstream3.plugins.BasePlugin
import com.lagradost.cloudstream3.plugins.CloudstreamPlugin

@CloudstreamPlugin
class MsaRepoPlugin : BasePlugin() {
    override fun load() {
        registerMainAPI(MsaRepoProvider())
    }
}
