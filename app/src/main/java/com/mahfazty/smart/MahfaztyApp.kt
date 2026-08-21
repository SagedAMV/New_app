package com.mahfazty.smart

import android.app.Application
import android.content.Context
import com.mahfazty.smart.data.ClientsRepository
import com.mahfazty.smart.data.SettingsRepository
import com.mahfazty.smart.data.WalletRepository
import com.mahfazty.smart.data.db.AppDatabase

/**
 * نقطة دخول التطبيق + حاوية التبعيات اليدوية (Manual DI).
 * بسيطة وواضحة لمشروع بهذا الحجم — بدون مكتبات حقن خارجية.
 */
class MahfaztyApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}

class AppContainer(context: Context) {
    val database: AppDatabase by lazy { AppDatabase.getInstance(context) }

    val settingsRepository: SettingsRepository by lazy { SettingsRepository(database) }

    val walletRepository: WalletRepository by lazy {
        WalletRepository(database, settingsRepository)
    }

    val clientsRepository: ClientsRepository by lazy {
        ClientsRepository(database, walletRepository)
    }
}
